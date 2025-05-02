#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.BRAVE_SEARCH_API_KEY; // provided by MCP config
if (!API_KEY) {
  console.error('Error: BRAVE_SEARCH_API_KEY environment variable is not set.');
  process.exit(1);
}

class BraveSearchMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'brave-search-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.search.brave.com/v1',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search',
          description: 'Search the web using Brave Search',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              count: {
                type: 'number',
                description: 'Number of results to return (max 20)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_suggestions',
          description: 'Get search suggestions for a query',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Partial search query',
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'search': {
            if (!request.params.arguments.query) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Query is required'
              );
            }

            const count = Math.min(request.params.arguments.count || 10, 20);
            
            const response = await this.axiosInstance.get('/search', {
              params: {
                q: request.params.arguments.query,
                count
              }
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          }

          case 'get_suggestions': {
            if (!request.params.arguments.query) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Query is required'
              );
            }
            
            const response = await this.axiosInstance.get('/suggest', {
              params: {
                q: request.params.arguments.query
              }
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
                    const status = error.response?.status;
                    const data = error.response?.data;
                    return {
                      content: [
                        {
                          type: 'text',
                          text: `Brave Search API error (status ${status}): ${JSON.stringify(data, null, 2)}`,
                        },
                      ],
                      isError: true,
                    };
                  }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Brave Search MCP server running on stdio');
  }
}

const server = new BraveSearchMcpServer();
server.run().catch(console.error);
