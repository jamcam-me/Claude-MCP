# Claude MCP Servers

This repository contains Model Context Protocol (MCP) servers for Claude Desktop. These servers extend Claude's capabilities by providing access to external tools and resources.

## Available MCP Servers

### 1. GitHub Server

The GitHub server provides tools for interacting with the GitHub API.

**Tools:**
- `fetch_repositories`: Fetch GitHub repositories for a user
- `fetch_issues`: Fetch issues for a GitHub repository
- `fetch_pull_requests`: Fetch pull requests for a GitHub repository

**Environment Variables:**
- `GITHUB_API_TOKEN`: GitHub API token for authentication (optional)

### 2. Brave Search Server

The Brave Search server provides tools for searching the web using the Brave Search API.

**Tools:**
- `search`: Search the web using Brave Search
- `get_suggestions`: Get search suggestions for a query

**Environment Variables:**
- `BRAVE_SEARCH_API_KEY`: Brave Search API key for authentication

### 3. Filesystem Server

The Filesystem server provides tools for interacting with the local filesystem.

**Tools:**
- `read_file`: Read a file from the filesystem
- `write_file`: Write data to a file in the filesystem
- `list_files`: List files in a directory

**Environment Variables:**
- `FILESYSTEM_BASE_DIRS`: Comma-separated list of base directories that the server is allowed to access

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in the Claude Desktop configuration file:
   ```
   c:/Users/JamesCameron/AppData/Roaming/Claude/claude_desktop_config.json
   ```

3. Run the servers:
   ```
   npm run start:github
   npm run start:brave-search
   npm run start:filesystem
   ```

## Claude Desktop Configuration

The Claude Desktop configuration file should contain the following MCP server settings:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["D:\\Dev-New2005\\Claude-MCP\\src\\mcp-servers\\github-server.js"],
      "env": {
        "GITHUB_API_TOKEN": "your-github-token"
      },
      "disabled": false,
      "autoApprove": []
    },
    "brave-search": {
      "command": "node",
      "args": ["D:\\Dev-New2005\\Claude-MCP\\src\\mcp-servers\\brave-search-server.js"],
      "env": {
        "BRAVE_SEARCH_API_KEY": "your-brave-search-api-key"
      },
      "disabled": false,
      "autoApprove": []
    },
    "filesystem": {
      "command": "node",
      "args": ["D:\\Dev-New2005\\Claude-MCP\\src\\mcp-servers\\filesystem-server.js"],
      "env": {
        "FILESYSTEM_BASE_DIRS": "D:\\Dev-New2005\\Claude-MCP,D:\\Dev-New2005\\Claude-MCP\\data"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Usage

Once the MCP servers are configured and running, Claude will have access to the tools provided by these servers. You can ask Claude to use these tools to perform various tasks, such as:

- "Search for information about climate change using Brave Search"
- "Fetch my GitHub repositories"
- "Read the sample.txt file from the data directory"
