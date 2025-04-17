#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

class FetchServer {
  constructor() {
    this.server = new Server(
      {
        name: 'fetch-server',
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

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'fetch',
          description: 'Fetch data from a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to fetch data from'
              },
              method: {
                type: 'string',
                description: 'HTTP method to use (GET, POST, PUT, DELETE)',
                default: 'GET'
              },
              headers: {
                type: 'object',
                description: 'HTTP headers to include in the request'
              },
              body: {
                type: 'string',
                description: 'Body to include in the request (for POST, PUT)'
              },
              timeout: {
                type: 'number',
                description: 'Request timeout in milliseconds',
                default: 10000
              }
            },
            required: ['url'],
          },
        },
        {
          name: 'fetch_json',
          description: 'Fetch JSON data from a URL and parse it',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to fetch JSON data from'
              },
              method: {
                type: 'string',
                description: 'HTTP method to use (GET, POST, PUT, DELETE)',
                default: 'GET'
              },
              headers: {
                type: 'object',
                description: 'HTTP headers to include in the request'
              },
              body: {
                type: 'object',
                description: 'JSON body to include in the request (for POST, PUT)'
              },
              timeout: {
                type: 'number',
                description: 'Request timeout in milliseconds',
                default: 10000
              }
            },
            required: ['url'],
          },
        },
        {
          name: 'fetch_html',
          description: 'Fetch HTML content from a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to fetch HTML content from'
              },
              selector: {
                type: 'string',
                description: 'CSS selector to extract specific content (optional)'
              },
              timeout: {
                type: 'number',
                description: 'Request timeout in milliseconds',
                default: 10000
              }
            },
            required: ['url'],
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'fetch': {
            const url = request.params.arguments?.url;
            const method = request.params.arguments?.method || 'GET';
            const headers = request.params.arguments?.headers || {};
            const body = request.params.arguments?.body;
            const timeout = request.params.arguments?.timeout || 10000;
            
            if (!url) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'URL is required'
              );
            }
            
            try {
              const response = await this.fetchUrl(url, method, headers, body, timeout);
              
              return {
                content: [{
                  type: "text",
                  text: response.body
                }]
              };
            } catch (error) {
              throw new McpError(
                ErrorCode.InternalError,
                `Error fetching URL: ${error.message}`
              );
            }
          }
          
          case 'fetch_json': {
            const url = request.params.arguments?.url;
            const method = request.params.arguments?.method || 'GET';
            const headers = request.params.arguments?.headers || {};
            const body = request.params.arguments?.body;
            const timeout = request.params.arguments?.timeout || 10000;
            
            if (!url) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'URL is required'
              );
            }
            
            // Add JSON content type header if not provided
            if (!headers['Content-Type'] && (method === 'POST' || method === 'PUT')) {
              headers['Content-Type'] = 'application/json';
            }
            
            try {
              const jsonBody = body ? JSON.stringify(body) : undefined;
              const response = await this.fetchUrl(url, method, headers, jsonBody, timeout);
              
              try {
                const jsonResponse = JSON.parse(response.body);
                
                return {
                  content: [{
                    type: "text",
                    text: JSON.stringify(jsonResponse, null, 2)
                  }]
                };
              } catch (parseError) {
                throw new McpError(
                  ErrorCode.InternalError,
                  `Error parsing JSON response: ${parseError.message}`
                );
              }
            } catch (error) {
              throw new McpError(
                ErrorCode.InternalError,
                `Error fetching JSON: ${error.message}`
              );
            }
          }
          
          case 'fetch_html': {
            const url = request.params.arguments?.url;
            const selector = request.params.arguments?.selector;
            const timeout = request.params.arguments?.timeout || 10000;
            
            if (!url) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'URL is required'
              );
            }
            
            try {
              const response = await this.fetchUrl(url, 'GET', {}, undefined, timeout);
              
              let htmlContent = response.body;
              
              // If a selector is provided, extract the matching content
              // Note: In a real implementation, we would use a proper HTML parser
              // This is a simplified example that just returns the full HTML
              if (selector) {
                htmlContent = `Selector '${selector}' provided, but HTML parsing is not implemented in this example. Full HTML content returned.`;
              }
              
              return {
                content: [{
                  type: "text",
                  text: htmlContent
                }]
              };
            } catch (error) {
              throw new McpError(
                ErrorCode.InternalError,
                `Error fetching HTML: ${error.message}`
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
          `Fetch operation error: ${error.message}`
        );
      }
    });
  }

  // Helper method to fetch data from a URL
  fetchUrl(url, method, headers, body, timeout) {
    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(url);
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: method,
          headers: headers,
          timeout: timeout
        };
        
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const req = client.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data
            });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Request timed out after ${timeout}ms`));
        });
        
        if (body) {
          req.write(body);
        }
        
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Fetch MCP server running on stdio');
  }
}

const server = new FetchServer();
server.run().catch(console.error);