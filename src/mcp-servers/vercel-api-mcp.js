#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch'; // Ensure this package is installed

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN; // provided by MCP config

class VercelAPIServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vercel-api',
        version: '0.1.0', // Assuming a basic version
      },
      {
        capabilities: {
          tools: {}, // Declare that this server provides tools
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

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_projects': {
            if (!VERCEL_API_TOKEN) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'VERCEL_API_TOKEN not set in environment variables.'
              );
            }

            // Placeholder for actual Vercel API call
            // In a real scenario, you would make an HTTP request to Vercel API
            // For example:
            // const response = await fetch('https://api.vercel.com/v9/projects', {
            //   headers: {
            //     'Authorization': `Bearer ${VERCEL_API_TOKEN}`
            //   }
            // });
            // const data = await response.json();
            // return {
            //   content: [
            //     {
            //       type: 'text',
            //       text: JSON.stringify(data, null, 2),
            //     },
            //   ],
            // };

            return {
              content: [
                {
                  type: 'text',
                  text: 'Vercel API tool is configured. Replace this with actual Vercel API calls. VERCEL_API_TOKEN: ' + (VERCEL_API_TOKEN ? 'Set' : 'Not Set'),
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
        // Basic error handling for fetch/other issues
        return {
          content: [
            {
              type: 'text',
              text: `Vercel API tool error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vercel MCP server running on stdio');
  }
}

const serverInstance = new VercelAPIServer();
serverInstance.run().catch(console.error);