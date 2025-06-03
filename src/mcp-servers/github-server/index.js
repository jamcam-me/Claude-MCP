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

const API_TOKEN = process.env.GITHUB_API_TOKEN; // provided by MCP config

class GithubMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'github-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(API_TOKEN && { 'Authorization': `token ${API_TOKEN}` })
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
          name: 'fetch_repositories',
          description: 'Fetch GitHub repositories for a user',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'GitHub username',
              },
            },
            required: ['username'],
          },
        },
        {
          name: 'fetch_issues',
          description: 'Fetch issues for a GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'fetch_pull_requests',
          description: 'Fetch pull requests for a GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'Repository owner',
              },
              repo: {
                type: 'string',
                description: 'Repository name',
              },
            },
            required: ['owner', 'repo'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'fetch_repositories': {
            if (!request.params.arguments.username) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Username is required'
              );
            }

            const response = await this.axiosInstance.get(
              `/users/${request.params.arguments.username}/repos`
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          }

          case 'fetch_issues': {
            const { owner, repo } = request.params.arguments;
            if (!owner || !repo) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Owner and repo are required'
              );
            }

            const response = await this.axiosInstance.get(
              `/repos/${owner}/${repo}/issues`
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data, null, 2),
                },
              ],
            };
          }

          case 'fetch_pull_requests': {
            const { owner, repo } = request.params.arguments;
            if (!owner || !repo) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Owner and repo are required'
              );
            }

            const response = await this.axiosInstance.get(
              `/repos/${owner}/${repo}/pulls`
            );

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
          return {
            content: [
              {
                type: 'text',
                text: `GitHub API error: ${
                  error.response?.data.message ?? error.message
                }`,
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
    console.error('GitHub MCP server running on stdio');
  }
}

const server = new GithubMcpServer();
server.run().catch(console.error);
