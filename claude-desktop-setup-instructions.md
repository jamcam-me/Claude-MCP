# Claude Desktop MCP Server Setup Instructions

This document provides step-by-step instructions for configuring Claude Desktop to use the MCP servers in this repository.

## Locating the Claude Desktop Configuration File

1. The Claude Desktop configuration file is typically located at:
   ```
   C:\Users\JamesCameron\AppData\Roaming\Claude\claude_desktop_config.json
   ```

2. Before making changes, create a backup of the current configuration:
   ```
   copy "C:\Users\JamesCameron\AppData\Roaming\Claude\claude_desktop_config.json" "C:\Users\JamesCameron\AppData\Roaming\Claude\claude_desktop_config.json.backup"
   ```

## Updating the Configuration File

1. Open the configuration file in a text editor:
   ```
   notepad "C:\Users\JamesCameron\AppData\Roaming\Claude\claude_desktop_config.json"
   ```

2. Look for the `mcpServers` section in the file. If it doesn't exist, add it at the root level of the JSON object.

3. Add or update the following server configurations in the `mcpServers` section:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/fetch-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "mindmap": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/mindmap-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "market-analysis": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/market-analysis-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "financial-modeling": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/financial-modeling-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "technical-documentation": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/technical-documentation-server.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

4. Make sure the paths in the `args` arrays are correct and point to the actual location of the server files on your system. If the repository is not in `D:/github/Claude-MCP`, update the paths accordingly.

## Example Complete Configuration

Here's an example of what the complete configuration file might look like:

```json
{
  "apiKey": "your-api-key-here",
  "model": "claude-3-opus-20240229",
  "systemPrompt": "You are Claude, an AI assistant created by Anthropic.",
  "temperature": 0.7,
  "maxTokens": 4096,
  "mcpServers": {
    "fetch": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/fetch-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "mindmap": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/mindmap-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "market-analysis": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/market-analysis-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "financial-modeling": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/financial-modeling-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "technical-documentation": {
      "command": "node",
      "args": ["D:/github/Claude-MCP/src/mcp-servers/technical-documentation-server.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Applying the Changes

1. Save the configuration file after making the changes.

2. Restart Claude Desktop to apply the changes.

3. To verify that the servers are properly configured, open Claude Desktop and check if the servers are listed in the MCP servers section of the settings.

## Troubleshooting

If the servers don't appear in Claude Desktop after restarting:

1. Check the configuration file for syntax errors. Make sure all quotes, commas, and brackets are properly placed.

2. Verify that the paths to the server files are correct.

3. Make sure the servers are properly implemented and can be started individually using the npm scripts:
   ```
   cd D:/github/Claude-MCP
   npm run start:fetch
   npm run start:mindmap
   npm run start:market-analysis
   npm run start:financial-modeling
   npm run start:technical-doc
   ```

4. Check the Claude Desktop logs for any error messages related to the MCP servers.

## Setting Up Local MCP Servers

If you also want to set up the MCP servers in the Roo-Code/MCP directory:

1. Create directories for each new server:
   ```
   mkdir "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\fetch-server"
   mkdir "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\mindmap-server"
   mkdir "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\market-analysis-server"
   ```

2. Copy the server files from the Claude-MCP repository to these directories:
   ```
   copy "D:\github\Claude-MCP\src\mcp-servers\fetch-server.js" "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\fetch-server\index.js"
   copy "D:\github\Claude-MCP\src\mcp-servers\mindmap-server.js" "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\mindmap-server\index.js"
   copy "D:\github\Claude-MCP\src\mcp-servers\market-analysis-server.js" "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\market-analysis-server\index.js"
   ```

3. Install dependencies in each directory:
   ```
   cd "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\fetch-server"
   npm init -y
   npm install @modelcontextprotocol/sdk
   
   cd "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\mindmap-server"
   npm init -y
   npm install @modelcontextprotocol/sdk
   
   cd "C:\Users\JamesCameron\AppData\Roaming\Roo-Code\MCP\market-analysis-server"
   npm init -y
   npm install @modelcontextprotocol/sdk
   ```

4. Update the Claude Desktop configuration to point to these local servers instead:
   ```json
   {
     "mcpServers": {
       "fetch": {
         "command": "node",
         "args": ["C:/Users/JamesCameron/AppData/Roaming/Roo-Code/MCP/fetch-server/index.js"],
         "disabled": false,
         "alwaysAllow": []
       },
       "mindmap": {
         "command": "node",
         "args": ["C:/Users/JamesCameron/AppData/Roaming/Roo-Code/MCP/mindmap-server/index.js"],
         "disabled": false,
         "alwaysAllow": []
       },
       "market-analysis": {
         "command": "node",
         "args": ["C:/Users/JamesCameron/AppData/Roaming/Roo-Code/MCP/market-analysis-server/index.js"],
         "disabled": false,
         "alwaysAllow": []
       }
     }
   }
   ```

5. Restart Claude Desktop to apply the changes.