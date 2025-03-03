#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

// Base directories that the server is allowed to access
const BASE_DIRS = process.env.FILESYSTEM_BASE_DIRS 
  ? process.env.FILESYSTEM_BASE_DIRS.split(',') 
  : ['D:\\Dev-New2005\\Claude-MCP', 'D:\\Dev-New2005\\Claude-MCP\\data'];

class FilesystemMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'filesystem-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // Validate that the requested path is within allowed base directories
  validatePath(requestedPath) {
    const normalizedPath = path.normalize(requestedPath);
    
    for (const baseDir of BASE_DIRS) {
      const normalizedBaseDir = path.normalize(baseDir);
      if (normalizedPath.startsWith(normalizedBaseDir)) {
        return normalizedPath;
      }
    }
    
    throw new McpError(
      ErrorCode.InvalidParams,
      `Access denied: Path must be within allowed directories`
    );
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_file',
          description: 'Read a file from the filesystem',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'write_file',
          description: 'Write data to a file in the filesystem',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file',
              },
              content: {
                type: 'string',
                description: 'Content to write to the file',
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'list_files',
          description: 'List files in a directory',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Directory path',
              },
              recursive: {
                type: 'boolean',
                description: 'Whether to list files recursively',
                default: false,
              },
            },
            required: ['directory'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'read_file': {
            if (!request.params.arguments.path) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'File path is required'
              );
            }

            const filePath = this.validatePath(request.params.arguments.path);
            
            try {
              const content = await fs.readFile(filePath, 'utf8');
              
              return {
                content: [
                  {
                    type: 'text',
                    text: content,
                  },
                ],
              };
            } catch (err) {
              throw new McpError(
                ErrorCode.InternalError,
                `Error reading file: ${err.message}`
              );
            }
          }

          case 'write_file': {
            const { path: filePath, content } = request.params.arguments;
            
            if (!filePath || content === undefined) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'File path and content are required'
              );
            }

            const validatedPath = this.validatePath(filePath);
            
            try {
              // Ensure directory exists
              await fs.mkdir(path.dirname(validatedPath), { recursive: true });
              
              // Write file
              await fs.writeFile(validatedPath, content, 'utf8');
              
              return {
                content: [
                  {
                    type: 'text',
                    text: `File written successfully to ${validatedPath}`,
                  },
                ],
              };
            } catch (err) {
              throw new McpError(
                ErrorCode.InternalError,
                `Error writing file: ${err.message}`
              );
            }
          }

          case 'list_files': {
            const { directory, recursive = false } = request.params.arguments;
            
            if (!directory) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Directory path is required'
              );
            }

            const validatedPath = this.validatePath(directory);
            
            try {
              const files = await this.listFilesInDirectory(validatedPath, recursive);
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(files, null, 2),
                  },
                ],
              };
            } catch (err) {
              throw new McpError(
                ErrorCode.InternalError,
                `Error listing files: ${err.message}`
              );
            }
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Filesystem operation error: ${error.message}`
        );
      }
    });
  }

  async listFilesInDirectory(dirPath, recursive) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const result = [];
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        result.push({
          name: entry.name,
          path: entryPath,
          type: 'directory',
        });
        
        if (recursive) {
          const subDirFiles = await this.listFilesInDirectory(entryPath, true);
          result.push(...subDirFiles);
        }
      } else {
        result.push({
          name: entry.name,
          path: entryPath,
          type: 'file',
        });
      }
    }
    
    return result;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Filesystem MCP server running on stdio');
    console.error(`Allowed base directories: ${BASE_DIRS.join(', ')}`);
  }
}

const server = new FilesystemMcpServer();
server.run().catch(console.error);
