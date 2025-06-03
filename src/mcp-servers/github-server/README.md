# GitHub MCP Server

A Model Context Protocol (MCP) server that provides GitHub API integration for fetching repositories, issues, pull requests, and performing searches.

## Features

### Available Tools

1. **`fetch_repositories`** - Fetch GitHub repositories for a user or organization
   - Parameters: `username`, `type` (all/owner/member), `sort`, `per_page`
   - Returns: List of repositories with key metadata

2. **`fetch_repository`** - Fetch detailed information about a specific repository
   - Parameters: `owner`, `repo`
   - Returns: Comprehensive repository details

3. **`fetch_issues`** - Fetch issues for a GitHub repository
   - Parameters: `owner`, `repo`, `state` (open/closed/all), `labels`, `per_page`
   - Returns: List of issues (excludes pull requests)

4. **`fetch_pull_requests`** - Fetch pull requests for a GitHub repository
   - Parameters: `owner`, `repo`, `state` (open/closed/all), `per_page`
   - Returns: List of pull requests with metadata

5. **`search_repositories`** - Search GitHub repositories using GitHub's search API
   - Parameters: `query`, `sort` (stars/forks/help-wanted-issues/updated), `order` (asc/desc), `per_page`
   - Returns: Search results with repository details

## Setup

### Prerequisites

- Node.js (v16 or higher)
- GitHub API token (optional, but recommended for higher rate limits)

### Installation

1. Navigate to the server directory:
   ```bash
   cd src/mcp-servers/github-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set your GitHub API token (optional):
   ```bash
   export GITHUB_API_TOKEN="your_github_token_here"
   ```

### Running the Server

```bash
npm start
# or
node index.js
```

## Configuration

### Claude Desktop Integration

Add this configuration to your Claude Desktop config file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github-server": {
      "command": "node",
      "args": [
        "D:\\github\\Claude-MCP\\src\\mcp-servers\\github-server\\index.js"
      ],
      "env": {
        "GITHUB_API_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

### Environment Variables

- `GITHUB_API_TOKEN` (optional): Your GitHub personal access token
  - Without token: 60 requests per hour
  - With token: 5,000 requests per hour per token

## Usage Examples

### Fetch User Repositories
```json
{
  "tool": "fetch_repositories",
  "arguments": {
    "username": "octocat",
    "type": "owner",
    "sort": "updated",
    "per_page": 10
  }
}
```

### Search Repositories
```json
{
  "tool": "search_repositories",
  "arguments": {
    "query": "language:javascript stars:>1000",
    "sort": "stars",
    "order": "desc",
    "per_page": 5
  }
}
```

### Fetch Repository Issues
```json
{
  "tool": "fetch_issues",
  "arguments": {
    "owner": "microsoft",
    "repo": "vscode",
    "state": "open",
    "labels": "bug,help-wanted",
    "per_page": 20
  }
}
```

## API Rate Limits

- **Unauthenticated requests**: 60 per hour per IP
- **Authenticated requests**: 5,000 per hour per token
- **Search API**: 30 requests per minute (authenticated)

The server automatically includes appropriate headers and handles rate limit responses.

## Error Handling

The server provides comprehensive error handling for:
- Invalid parameters
- GitHub API errors (rate limits, not found, etc.)
- Network connectivity issues
- Authentication problems

Error responses include helpful messages and HTTP status codes when available.

## Dependencies

- `@modelcontextprotocol/sdk`: ^1.12.1
- `axios`: ^1.9.0

## Business Value for Apogee Insights

### Development Workflow Integration
- **Repository Analysis**: Monitor competitor repositories and track industry trends
- **Issue Tracking**: Analyze common problems across similar projects
- **Collaboration Insights**: Track pull request patterns and contribution metrics

### Strategic Intelligence
- **Technology Trends**: Search for repositories by language, topics, and popularity
- **Talent Acquisition**: Identify active contributors in specific technology areas
- **Partnership Opportunities**: Discover complementary projects and potential integrations

### Risk Management
- **Dependency Monitoring**: Track updates and issues in critical dependencies
- **Security Awareness**: Monitor security-related issues and patches
- **Compliance Tracking**: Ensure proper licensing and governance practices

## Version History

- **v0.1.0**: Initial release with basic GitHub API integration
- Enhanced error handling and comprehensive tool set
- Optimized for Claude Desktop MCP integration

## Support

For issues or questions:
1. Check the troubleshooting logs in `/troubleshooting/`
2. Verify GitHub API token permissions
3. Confirm network connectivity to api.github.com

## License

This MCP server is part of the Claude-MCP project and follows the same licensing terms.