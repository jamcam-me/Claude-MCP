#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import os from 'os';

class UrlAccessServer {
  constructor() {
    this.server = new Server(
      { name: 'url-access', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );
    this.tunnelsFilePath = path.join(process.cwd(), 'tunnels.json');
    
    // Create or load tunnels
    this.tunnels = this.loadOrCreateTunnels();
    
    this.setupToolHandlers();
    this.server.onerror = (err) => console.log('[MCP Error]', err);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  loadOrCreateTunnels() {
    try {
      if (existsSync(this.tunnelsFilePath)) {
        console.log(`Loading tunnels from ${this.tunnelsFilePath}`);
        const data = readFileSync(this.tunnelsFilePath, 'utf8');
        return JSON.parse(data);
      } else {
        console.log('tunnels.json not found, creating default values');
        
        // Get local IP address
        const localIp = this.getLocalIpAddress();
        
        // Create default tunnels
        const tunnels = {
          "localhost": "http://localhost:3000",
          "local-network": `http://${localIp}:3000`
        };
        
        // Write to file
        writeFileSync(this.tunnelsFilePath, JSON.stringify(tunnels, null, 2));
        console.log(`Created tunnels.json with default URLs`);
        
        return tunnels;
      }
    } catch (err) {
      console.error(`Error with tunnels file: ${err.message}`);
      
      // Return default values as fallback
      return {
        "localhost": "http://localhost:3000"
      };
    }
  }
  
  getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'localhost';
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'getUrls',
          description: 'Get website access URLs',
          inputSchema: { type: 'object', properties: {}, required: [] },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'getUrls') {
        return { content: [{ type: 'json', data: this.tunnels }] };
      }
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  async run() {
    await this.server.connect(new StdioServerTransport());
    console.log('URL Access MCP server running');
    
    // Display URLs in console for convenience
    console.log('\n==================================');
    console.log('Available URLs:');
    for (const [name, url] of Object.entries(this.tunnels)) {
      console.log(`${name}: ${url}`);
    }
    console.log('==================================\n');
  }
}

const server = new UrlAccessServer();
server.run().catch(console.error);