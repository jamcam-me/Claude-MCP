#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.WHIMSICAL_API_KEY;
if (!API_KEY) {
  console.error('Error: WHIMSICAL_API_KEY is not set.');
  process.exit(1);
}

class WhimsicalMcpServer {
  constructor() {
    this.server = new Server(
      { name: 'whimsical-server', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );

    this.http = axios.create({
      baseURL: 'https://api.whimsical.com/api/v1',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' },
    });

    this.setupToolHandlers();

    this.server.onerror = (err) => console.error('[MCP Error]', err);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_whimsical_boards',
          description: 'List all Whimsical boards',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
        {
          name: 'fetch_whimsical_board',
          description: 'Fetch a Whimsical board by ID',
          inputSchema: {
            type: 'object',
            properties: { board_id: { type: 'string', description: 'Board ID' } },
            required: ['board_id'],
          },
        },
        {
          name: 'create_whimsical_board',
          description: 'Create a new Whimsical board',
          inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'Board name' } },
            required: ['name'],
          },
        },
        {
          name: 'create_whimsical_diagram',
          description: 'Create a new diagram on a board',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Diagram type' },
              template: { type: 'string', description: 'Template name' },
              initial_nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    parent: { type: 'string' },
                  },
                },
              },
            },
            required: ['type'],
          },
        },
        {
          name: 'update_whimsical_diagram',
          description: 'Update nodes on a Whimsical board',
          inputSchema: {
            type: 'object',
            properties: {
              board_id: { type: 'string', description: 'Board ID' },
              updates: { type: 'array', items: { type: 'object' } },
            },
            required: ['board_id', 'updates'],
          },
        },
        {
          name: 'export_whimsical_diagram',
          description: 'Export a Whimsical board to an image or PDF',
          inputSchema: {
            type: 'object',
            properties: {
              board_id: { type: 'string', description: 'Board ID' },
              format: { type: 'string', description: 'Export format (png/pdf)' },
            },
            required: ['board_id', 'format'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_whimsical_boards': {
            const response = await this.http.get('/boards');
            return { content: [{ type: 'json', data: response.data }] };
          }
          case 'fetch_whimsical_board': {
            const id = request.params.arguments.board_id;
            const response = await this.http.get(`/boards/${id}`);
            return { content: [{ type: 'json', data: response.data }] };
          }
          case 'create_whimsical_board': {
            const payload = { name: request.params.arguments.name };
            const response = await this.http.post('/boards', payload);
            return { content: [{ type: 'json', data: response.data }] };
          }
          case 'create_whimsical_diagram': {
            const payload = {
              type: request.params.arguments.type,
              template: request.params.arguments.template,
              initialNodes: request.params.arguments.initial_nodes,
            };
            const response = await this.http.post('/diagrams', payload);
            return { content: [{ type: 'json', data: response.data }] };
          }
          case 'update_whimsical_diagram': {
            const id = request.params.arguments.board_id;
            const response = await this.http.patch(`/boards/${id}/nodes`, request.params.arguments.updates);
            return { content: [{ type: 'json', data: response.data }] };
          }
          case 'export_whimsical_diagram': {
            const id = request.params.arguments.board_id;
            const fmt = request.params.arguments.format;
            const response = await this.http.get(`/boards/${id}/export`, { params: { format: fmt }, responseType: 'arraybuffer' });
            const data = Buffer.from(response.data, 'binary').toString('base64');
            return { content: [{ type: 'text', text: data }] };
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const data = error.response?.data;
          return {
            content: [{ type: 'text', text: `Whimsical API error (status ${status}): ${JSON.stringify(data)}` }],
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
    console.error('Whimsical MCP server running on stdio');
  }
}

const server = new WhimsicalMcpServer();
server.run().catch(console.error);