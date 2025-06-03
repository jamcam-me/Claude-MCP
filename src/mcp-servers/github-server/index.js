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

const API_TOKEN = process.env.GITHUB_API_TOKEN;

class GitHubServer {
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
        'User-Agent': 'GitHub-MCP-Server/0.1.0',
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
          description: 'Fetch GitHub repositories for a user or organization',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'GitHub username or organization name',
              },
              type: {
                type: 'string',
                description: 'Type of repositories (all, owner, member)',
                enum: ['all', 'owner', 'member'],
                default: 'owner'
              },
              sort: {
                type: 'string',
                description: 'Sort repositories by (created, updated, pushed, full_name)',
                enum: ['created', 'updated', 'pushed', 'full_name'],
                default: 'updated'
              },
              per_page: {
                type: 'number',
                description: 'Number of repositories per page (max 100)',
                default: 30,
                maximum: 100
              }
            },
            required: ['username'],
          },
        },
        {
          name: 'fetch_repository',
          description: 'Fetch detailed information about a specific GitHub repository',
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
              state: {
                type: 'string',
                description: 'Issue state (open, closed, all)',
                enum: ['open', 'closed', 'all'],
                default: 'open'
              },
              labels: {
                type: 'string',
                description: 'Comma-separated list of label names'
              },
              per_page: {
                type: 'number',
                description: 'Number of issues per page (max 100)',
                default: 30,
                maximum: 100
              }
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
              state: {
                type: 'string',
                description: 'Pull request state (open, closed, all)',
                enum: ['open', 'closed', 'all'],
                default: 'open'
              },
              per_page: {
                type: 'number',
                description: 'Number of pull requests per page (max 100)',
                default: 30,
                maximum: 100
              }
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'search_repositories',
          description: 'Search GitHub repositories using GitHub search API',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (e.g., "language:javascript", "topic:react")',
              },
              sort: {
                type: 'string',
                description: 'Sort by (stars, forks, help-wanted-issues, updated)',
                enum: ['stars', 'forks', 'help-wanted-issues', 'updated'],
                default: 'stars'
              },
              order: {
                type: 'string',
                description: 'Sort order (asc, desc)',
                enum: ['asc', 'desc'],
                default: 'desc'
              },
              per_page: {
                type: 'number',
                description: 'Number of repositories per page (max 100)',
                default: 30,
                maximum: 100
              }
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        switch (name) {
          case 'fetch_repositories': {
            const { username, type = 'owner', sort = 'updated', per_page = 30 } = args;
            if (!username) {
              throw new McpError(ErrorCode.InvalidParams, 'Username is required');
            }

            const params = new URLSearchParams({
              type,
              sort,
              per_page: per_page.toString()
            });

            const response = await this.axiosInstance.get(
              `/users/${username}/repos?${params}`
            );

            const repos = response.data.map(repo => ({
              name: repo.name,
              full_name: repo.full_name,
              description: repo.description,
              html_url: repo.html_url,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              updated_at: repo.updated_at,
              topics: repo.topics
            }));

            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${repos.length} repositories for ${username}:\n\n${JSON.stringify(repos, null, 2)}`,
                },
              ],
            };
          }

          case 'fetch_repository': {
            const { owner, repo } = args;
            if (!owner || !repo) {
              throw new McpError(ErrorCode.InvalidParams, 'Owner and repo are required');
            }

            const response = await this.axiosInstance.get(`/repos/${owner}/${repo}`);
            const repoData = response.data;

            const summary = {
              name: repoData.name,
              full_name: repoData.full_name,
              description: repoData.description,
              html_url: repoData.html_url,
              language: repoData.language,
              stargazers_count: repoData.stargazers_count,
              forks_count: repoData.forks_count,
              open_issues_count: repoData.open_issues_count,
              created_at: repoData.created_at,
              updated_at: repoData.updated_at,
              topics: repoData.topics,
              license: repoData.license?.name
            };

            return {
              content: [
                {
                  type: 'text',
                  text: `Repository: ${owner}/${repo}\n\n${JSON.stringify(summary, null, 2)}`,
                },
              ],
            };
          }

          case 'fetch_issues': {
            const { owner, repo, state = 'open', labels, per_page = 30 } = args;
            if (!owner || !repo) {
              throw new McpError(ErrorCode.InvalidParams, 'Owner and repo are required');
            }

            const params = new URLSearchParams({
              state,
              per_page: per_page.toString()
            });
            if (labels) params.append('labels', labels);

            const response = await this.axiosInstance.get(
              `/repos/${owner}/${repo}/issues?${params}`
            );

            const issues = response.data
              .filter(issue => !issue.pull_request) // Exclude PRs
              .map(issue => ({
                number: issue.number,
                title: issue.title,
                state: issue.state,
                user: issue.user.login,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                labels: issue.labels.map(label => label.name),
                html_url: issue.html_url
              }));

            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${issues.length} issues in ${owner}/${repo}:\n\n${JSON.stringify(issues, null, 2)}`,
                },
              ],
            };
          }

          case 'fetch_pull_requests': {
            const { owner, repo, state = 'open', per_page = 30 } = args;
            if (!owner || !repo) {
              throw new McpError(ErrorCode.InvalidParams, 'Owner and repo are required');
            }

            const params = new URLSearchParams({
              state,
              per_page: per_page.toString()
            });

            const response = await this.axiosInstance.get(
              `/repos/${owner}/${repo}/pulls?${params}`
            );

            const prs = response.data.map(pr => ({
              number: pr.number,
              title: pr.title,
              state: pr.state,
              user: pr.user.login,
              created_at: pr.created_at,
              updated_at: pr.updated_at,
              html_url: pr.html_url,
              head: pr.head.ref,
              base: pr.base.ref
            }));

            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${prs.length} pull requests in ${owner}/${repo}:\n\n${JSON.stringify(prs, null, 2)}`,
                },
              ],
            };
          }

          case 'search_repositories': {
            const { query, sort = 'stars', order = 'desc', per_page = 30 } = args;
            if (!query) {
              throw new McpError(ErrorCode.InvalidParams, 'Query is required');
            }

            const params = new URLSearchParams({
              q: query,
              sort,
              order,
              per_page: per_page.toString()
            });

            const response = await this.axiosInstance.get(
              `/search/repositories?${params}`
            );

            const repos = response.data.items.map(repo => ({
              name: repo.name,
              full_name: repo.full_name,
              description: repo.description,
              html_url: repo.html_url,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              updated_at: repo.updated_at,
              topics: repo.topics
            }));

            return {
              content: [
                {
                  type: 'text',
                  text: `Search results for "${query}" (${response.data.total_count} total):\n\n${JSON.stringify(repos, null, 2)}`,
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.message;
          const status = error.response?.status;
          return {
            content: [
              {
                type: 'text',
                text: `GitHub API error (${status}): ${errorMessage}`,
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

// Run the server
const server = new GitHubServer();
server.run().catch(console.error);
