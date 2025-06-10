#!/usr/bin/env node
import { createWriteStream } from 'fs';
import { Console } from 'console';
import dotenv from 'dotenv';
dotenv.config();

// Create a writable stream to a log file
const output = createWriteStream('./vercel-mcp-output.log', { flags: 'a' });
const errorOutput = createWriteStream('./vercel-mcp-error.log', { flags: 'a' });

// Custom console that writes to the log files
const logger = new Console({ stdout: output, stderr: errorOutput });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { fetch } from 'undici';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;

export class VercelApiMcp {
  constructor() {
    logger.error(`[${new Date().toISOString()}] Loading Vercel API MCP Server - Latest Version`);
    this.server = new Server(
      {
        name: 'vercel-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => logger.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    logger.error(`[${new Date().toISOString()}] Setting up tool handlers...`);
    
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.error(`[${new Date().toISOString()}] ListTools request received`);
      return {
        tools: [
          {
            name: 'list_projects',
            description: 'List Vercel projects for the authenticated user.',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      logger.error(`[${new Date().toISOString()}] CallTool request received:`, JSON.stringify(request, null, 2));
      
      if (request.params.name === 'list_projects') {
        logger.error(`[${new Date().toISOString()}] Executing list_projects tool`);
        
        if (!VERCEL_API_TOKEN) {
          logger.error(`[${new Date().toISOString()}] VERCEL_API_TOKEN not set`);
          throw new Error('VERCEL_API_TOKEN not set in environment variables.');
        }

        try {
          logger.error(`[${new Date().toISOString()}] Making API call to Vercel...`);
          const response = await fetch('https://api.vercel.com/v9/projects', {
            headers: {
              Authorization: `Bearer ${VERCEL_API_TOKEN}`,
            },
          });

          logger.error(`[${new Date().toISOString()}] Vercel API response status: ${response.status}`);

          if (!response.ok) {
            const errorData = await response.json();
            logger.error(`[${new Date().toISOString()}] Vercel API error:`, errorData);
            throw new Error(
              `Vercel API error: ${response.status} ${response.statusText} - ${
                errorData.error?.message || 'Unknown error'
              }`
            );
          }

          const data = await response.json();
          logger.error(`[${new Date().toISOString()}] Vercel API call successful, returning data`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error(`[${new Date().toISOString()}] Error in list_projects:`, error);
          throw new Error(`Failed to fetch Vercel projects: ${error.message}`);
        }
      } else {
        logger.error(`[${new Date().toISOString()}] Unknown tool: ${request.params.name}`);
        throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.error(`[${new Date().toISOString()}] ListResources request received`);
      return {
        resources: [
          {
            uri: 'vercel-api://projects',
            description: 'Access Vercel project data.',
            name: 'Vercel Projects',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      logger.error(`[${new Date().toISOString()}] ReadResource request received:`, JSON.stringify(request, null, 2));
      
      if (request.params.uri === 'vercel-api://projects') {
        logger.error(`[${new Date().toISOString()}] Accessing vercel-api://projects resource`);
        
        if (!VERCEL_API_TOKEN) {
          logger.error(`[${new Date().toISOString()}] VERCEL_API_TOKEN not set for resource access`);
          throw new Error('VERCEL_API_TOKEN not set in environment variables.');
        }

        try {
          logger.error(`[${new Date().toISOString()}] Making API call to Vercel for resource...`);
          const response = await fetch('https://api.vercel.com/v9/projects', {
            headers: {
              Authorization: `Bearer ${VERCEL_API_TOKEN}`,
            },
          });

          logger.error(`[${new Date().toISOString()}] Vercel API response status for resource: ${response.status}`);

          if (!response.ok) {
            const errorData = await response.json();
            logger.error(`[${new Date().toISOString()}] Vercel API error for resource:`, errorData);
            throw new Error(
              `Vercel API error: ${response.status} ${response.statusText} - ${
                errorData.error?.message || 'Unknown error'
              }`
            );
          }

          const data = await response.json();
          logger.error(`[${new Date().toISOString()}] Vercel API call successful for resource, returning data`);
          return {
            contents: [
              {
                uri: request.params.uri,
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error(`[${new Date().toISOString()}] Error in resource access:`, error);
          throw new Error(`Failed to fetch Vercel projects for resource: ${error.message}`);
        }
      } else {
        logger.error(`[${new Date().toISOString()}] Unknown resource URI: ${request.params.uri}`);
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }
    });
    
    logger.error(`[${new Date().toISOString()}] All request handlers registered successfully`);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.error('Vercel API MCP server running on stdio');
  }

  start() {
    return this.run();
  }

  stop() {
    return this.server.close();
  }
}

// Standalone server start
const server = new VercelApiMcp();
server.run().catch(logger.error);