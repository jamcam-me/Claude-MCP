#!/usr/bin/env node
import { MCPServer, StdioServerTransport } from '@modelcontextprotocol/sdk';
import { fetch } from 'undici';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;

class VercelAPIServer extends MCPServer {
  constructor() {
    super('vercel-api');

    this.defineTool({
      name: 'list_projects',
      description: 'List Vercel projects for the authenticated user.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      async run() {
        if (!VERCEL_API_TOKEN) {
          throw new Error('VERCEL_API_TOKEN not set in environment variables.');
        }

        try {
          const response = await fetch('https://api.vercel.com/v9/projects', {
            headers: {
              Authorization: `Bearer ${VERCEL_API_TOKEN}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Vercel API error: ${response.status} ${response.statusText} - ${
                errorData.error?.message || 'Unknown error'
              }`
            );
          }

          const data = await response.json();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to fetch Vercel projects: ${error.message}`);
        }
      },
    });

    this.defineResource({
      uri: 'vercel-api://projects',
      description: 'Access Vercel project data.',
      async get() {
        return {
          content: [
            {
              type: 'text',
              text: 'Vercel API resource. Implement actual data fetching here.',
            },
          ],
        };
      },
    });
  }
}

const server = new VercelAPIServer();
const transport = new StdioServerTransport();
server.start(transport);
