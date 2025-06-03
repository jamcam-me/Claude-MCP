# Claude Desktop MCP Server Setup Instructions

This document provides step-by-step instructions for configuring Claude Desktop to use the MCP servers in this repository.

## Prerequisites

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Create a `.env` file in the workspace root containing the required API keys:
   ```bash
   BRAVE_SEARCH_API_KEY=your_brave_api_key
   # Add any other required API keys here
   ```

## Editing the MCP Configuration

1. Open the `.roo/mcp.json` file in the workspace root.

2. Locate or add the `mcpServers` section at the root level of the JSON object.

3. Point each server to the corresponding script under `claude-mcp/src/mcp-servers/`. For example:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/brave-search-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "fetch": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/fetch-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "mindmap": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/mindmap-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "market-analysis": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/market-analysis-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "financial-modeling": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/financial-modeling-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "technical-documentation": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/technical-documentation-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "whimsical": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/whimsical-server.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Example `.roo/mcp.json` Configuration

Here's an example of what your `.roo/mcp.json` file might look like:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/brave-search-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "fetch": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/fetch-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "mindmap": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/mindmap-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "market-analysis": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/market-analysis-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "financial-modeling": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/financial-modeling-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "technical-documentation": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/technical-documentation-server.js"],
      "disabled": false,
      "alwaysAllow": []
    },
    "whimsical": {
      "command": "node",
      "args": ["claude-mcp/src/mcp-servers/whimsical-server.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Starting the MCP Servers

To start the Brave Search server, run:

```bash
node claude-mcp/src/mcp-servers/brave-search-server.js
```

Similarly, start other servers:

```bash
node claude-mcp/src/mcp-servers/fetch-server.js
node claude-mcp/src/mcp-servers/mindmap-server.js
node claude-mcp/src/mcp-servers/market-analysis-server.js
node claude-mcp/src/mcp-servers/financial-modeling-server.js
node claude-mcp/src/mcp-servers/technical-documentation-server.js
node claude-mcp/src/mcp-servers/whimsical-server.js
```

## Applying the Changes

1. Save the configuration file after making the changes.

2. Restart Claude Desktop to apply the changes.

3. To verify that the servers are properly configured, open Claude Desktop and check if the servers are listed in the MCP servers section of the settings.

## Troubleshooting

If the servers don't appear in Claude Desktop after restarting:

1. Check the configuration file for syntax errors. Make sure all quotes, commas, and brackets are properly placed.

2. Verify that the paths to the server files are correct.

3. Make sure the servers are properly implemented and can be started individually by running the Node scripts directly:
   ```bash
   node claude-mcp/src/mcp-servers/brave-search-server.js
   node claude-mcp/src/mcp-servers/fetch-server.js
   node claude-mcp/src/mcp-servers/mindmap-server.js
   node claude-mcp/src/mcp-servers/market-analysis-server.js
   node claude-mcp/src/mcp-servers/financial-modeling-server.js
   node claude-mcp/src/mcp-servers/technical-documentation-server.js
   ```

4. Check the Claude Desktop logs for any error messages related to the MCP servers.
