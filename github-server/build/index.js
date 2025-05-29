#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
const API_KEY = process.env.GITHUB_PERSONAL_ACCESS_TOKEN; // provided by MCP config
if (!API_KEY) {
    throw new Error('GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required');
}
class GitHubServer {
    constructor() {
        this.server = new Server({
            name: 'github.com/modelcontextprotocol/servers/tree/main/src/github',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.axiosInstance = axios.create({
            baseURL: 'https://api.github.com/',
            headers: {
                Authorization: `token ${API_KEY}`,
                Accept: 'application/vnd.github.v3+json',
            },
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
                    name: 'create_or_update_file',
                    description: 'Create or update a single file in a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            path: { type: 'string', description: 'Path where to create/update the file' },
                            content: { type: 'string', description: 'Content of the file' },
                            message: { type: 'string', description: 'Commit message' },
                            branch: { type: 'string', description: 'Branch to create/update the file in' },
                            sha: { type: 'string', description: 'SHA of the file being replaced (required when updating existing files)' }
                        },
                        required: ['owner', 'repo', 'path', 'content', 'message', 'branch'],
                    },
                },
                {
                    name: 'push_files',
                    description: 'Push multiple files to a GitHub repository in a single commit',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            branch: { type: 'string', description: 'Branch to push to (e.g., \'main\' or \'master\')' },
                            files: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        path: { type: 'string' },
                                        content: { type: 'string' }
                                    },
                                    required: ['path', 'content']
                                },
                                description: 'Array of files to push'
                            },
                            message: { type: 'string', description: 'Commit message' }
                        },
                        required: ['owner', 'repo', 'branch', 'files', 'message'],
                    },
                },
                {
                    name: 'search_repositories',
                    description: 'Search for GitHub repositories',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: { type: 'string', description: 'Search query (see GitHub search syntax)' },
                            page: { type: 'number', description: 'Page number for pagination (default: 1)' },
                            perPage: { type: 'number', description: 'Number of results per page (default: 30, max: 100)' }
                        },
                        required: ['query'],
                    },
                },
                {
                    name: 'create_repository',
                    description: 'Create a new GitHub repository in your account',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Repository name' },
                            description: { type: 'string', description: 'Repository description' },
                            private: { type: 'boolean', description: 'Whether the repository should be private' },
                            autoInit: { type: 'boolean', description: 'Initialize with README.md' }
                        },
                        required: ['name'],
                    },
                },
                {
                    name: 'get_file_contents',
                    description: 'Get the contents of a file or directory from a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            path: { type: 'string', description: 'Path to the file or directory' },
                            branch: { type: 'string', description: 'Branch to get contents from' }
                        },
                        required: ['owner', 'repo', 'path'],
                    },
                },
                {
                    name: 'create_issue',
                    description: 'Create a new issue in a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string' },
                            repo: { type: 'string' },
                            title: { type: 'string' },
                            body: { type: 'string' },
                            assignees: { type: 'array', items: { type: 'string' } },
                            milestone: { type: 'number' },
                            labels: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['owner', 'repo', 'title'],
                    },
                },
                {
                    name: 'create_pull_request',
                    description: 'Create a new pull request in a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            title: { type: 'string', description: 'Pull request title' },
                            body: { type: 'string', description: 'Pull request body/description' },
                            head: { type: 'string', description: 'The name of the branch where your changes are implemented' },
                            base: { type: 'string', description: 'The name of the branch you want the changes pulled into' },
                            draft: { type: 'boolean', description: 'Whether to create the pull request as a draft' },
                            maintainer_can_modify: { type: 'boolean', description: 'Whether maintainers can modify the pull request' }
                        },
                        required: ['owner', 'repo', 'title', 'head', 'base'],
                    },
                },
                {
                    name: 'fork_repository',
                    description: 'Fork a GitHub repository to your account or specified organization',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            organization: { type: 'string', description: 'Optional: organization to fork to (defaults to your personal account)' }
                        },
                        required: ['owner', 'repo'],
                    },
                },
                {
                    name: 'create_branch',
                    description: 'Create a new branch in a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            branch: { type: 'string', description: 'Name for the new branch' },
                            from_branch: { type: 'string', description: 'Optional: source branch to create from (defaults to the repository\'s default branch)' }
                        },
                        required: ['owner', 'repo', 'branch'],
                    },
                },
                {
                    name: 'list_commits',
                    description: 'Get list of commits of a branch in a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string' },
                            repo: { type: 'string' },
                            sha: { type: 'string' },
                            page: { type: 'number' },
                            perPage: { type: 'number' }
                        },
                        required: ['owner', 'repo'],
                    },
                },
                {
                    name: 'list_issues',
                    description: 'List issues in a GitHub repository with filtering options',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string' },
                            repo: { type: 'string' },
                            direction: { type: 'string', enum: ['asc', 'desc'] },
                            labels: { type: 'array', items: { type: 'string' } },
                            page: { type: 'number' },
                            per_page: { type: 'number' },
                            since: { type: 'string' },
                            sort: { type: 'string', enum: ['created', 'updated', 'comments'] },
                            state: { type: 'string', enum: ['open', 'closed', 'all'] }
                        },
                        required: ['owner', 'repo'],
                    },
                },
                {
                    name: 'update_issue',
                    description: 'Update an existing issue in a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string' },
                            repo: { type: 'string' },
                            issue_number: { type: 'number' },
                            title: { type: 'string' },
                            body: { type: 'string' },
                            assignees: { type: 'array', items: { type: 'string' } },
                            milestone: { type: 'number' },
                            labels: { type: 'array', items: { type: 'string' } },
                            state: { type: 'string', enum: ['open', 'closed'] }
                        },
                        required: ['owner', 'repo', 'issue_number'],
                    },
                },
                {
                    name: 'add_issue_comment',
                    description: 'Add a comment to an existing issue',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string' },
                            repo: { type: 'string' },
                            issue_number: { type: 'number' },
                            body: { type: 'string' }
                        },
                        required: ['owner', 'repo', 'issue_number', 'body'],
                    },
                },
                {
                    name: 'search_code',
                    description: 'Search for code across GitHub repositories',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            q: { type: 'string' },
                            order: { type: 'string', enum: ['asc', 'desc'] },
                            page: { type: 'number', minimum: 1 },
                            per_page: { type: 'number', minimum: 1, maximum: 100 }
                        },
                        required: ['q'],
                    },
                },
                {
                    name: 'search_issues',
                    description: 'Search for issues and pull requests across GitHub repositories',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            q: { type: 'string' },
                            order: { type: 'string', enum: ['asc', 'desc'] },
                            page: { type: 'number', minimum: 1 },
                            per_page: { type: 'number', minimum: 1, maximum: 100 },
                            sort: { type: 'string', enum: ['comments', 'reactions', 'reactions-+1', 'reactions--1', 'reactions-smile', 'reactions-thinking_face', 'reactions-heart', 'reactions-tada', 'interactions', 'created', 'updated'] }
                        },
                        required: ['q'],
                    },
                },
                {
                    name: 'search_users',
                    description: 'Search for users on GitHub',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            q: { type: 'string' },
                            order: { type: 'string', enum: ['asc', 'desc'] },
                            page: { type: 'number', minimum: 1 },
                            per_page: { type: 'number', minimum: 1, maximum: 100 },
                            sort: { type: 'string', enum: ['followers', 'repositories', 'joined'] }
                        },
                        required: ['q'],
                    },
                },
                {
                    name: 'get_issue',
                    description: 'Get details of a specific issue in a GitHub repository.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string' },
                            repo: { type: 'string' },
                            issue_number: { type: 'number' }
                        },
                        required: ['owner', 'repo', 'issue_number'],
                    },
                },
                {
                    name: 'get_pull_request',
                    description: 'Get details of a specific pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                },
                {
                    name: 'list_pull_requests',
                    description: 'List and filter repository pull requests',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'State of the pull requests to return' },
                            head: { type: 'string', description: 'Filter by head user or head organization and branch name' },
                            base: { type: 'string', description: 'Filter by base branch name' },
                            sort: { type: 'string', enum: ['created', 'updated', 'popularity', 'long-running'], description: 'What to sort results by' },
                            direction: { type: 'string', enum: ['asc', 'desc'], description: 'The direction of the sort' },
                            per_page: { type: 'number', description: 'Results per page (max 100)' },
                            page: { type: 'number', description: 'Page number of the results' }
                        },
                        required: ['owner', 'repo'],
                    },
                },
                {
                    name: 'create_pull_request_review',
                    description: 'Create a review on a pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' },
                            commit_id: { type: 'string', description: 'The SHA of the commit that needs a review' },
                            body: { type: 'string', description: 'The body text of the review' },
                            event: { type: 'string', enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'], description: 'The review action to perform' },
                            comments: {
                                type: 'array',
                                items: {
                                    anyOf: [
                                        {
                                            type: 'object',
                                            properties: {
                                                path: { type: 'string', description: 'The relative path to the file being commented on' },
                                                position: { type: 'number', description: 'The position in the diff where you want to add a review comment' },
                                                body: { type: 'string', description: 'Text of the review comment' }
                                            },
                                            required: ['path', 'position', 'body']
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                path: { type: 'string', description: 'The relative path to the file being commented on' },
                                                line: { type: 'number', description: 'The line number in the file where you want to add a review comment' },
                                                body: { type: 'string', description: 'Text of the review comment' }
                                            },
                                            required: ['path', 'line', 'body']
                                        }
                                    ]
                                },
                                description: 'Comments to post as part of the review (specify either position or line, not both)'
                            }
                        },
                        required: ['owner', 'repo', 'pull_number', 'body', 'event'],
                    },
                },
                {
                    name: 'merge_pull_request',
                    description: 'Merge a pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' },
                            commit_title: { type: 'string', description: 'Title for the automatic commit message' },
                            commit_message: { type: 'string', description: 'Extra detail to append to automatic commit message' },
                            merge_method: { type: 'string', enum: ['merge', 'squash', 'rebase'], description: 'Merge method to use' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                },
                {
                    name: 'get_pull_request_files',
                    description: 'Get the list of files changed in a pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                },
                {
                    name: 'get_pull_request_status',
                    description: 'Get the combined status of all status checks for a pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                },
                {
                    name: 'update_pull_request_branch',
                    description: 'Update a pull request branch with the latest changes from the base branch',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' },
                            expected_head_sha: { type: 'string', description: 'The expected SHA of the pull request\'s HEAD ref' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                },
                {
                    name: 'get_pull_request_comments',
                    description: 'Get the review comments on a pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                },
                {
                    name: 'get_pull_request_reviews',
                    description: 'Get the reviews on a pull request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: { type: 'string', description: 'Repository owner (username or organization)' },
                            repo: { type: 'string', description: 'Repository name' },
                            pull_number: { type: 'number', description: 'Pull request number' }
                        },
                        required: ['owner', 'repo', 'pull_number'],
                    },
                }
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: rawArgs } = request.params;
            try {
                let response;
                switch (name) {
                    case 'create_or_update_file': {
                        const args = rawArgs;
                        response = await this.axiosInstance.put(`/repos/${args.owner}/${args.repo}/contents/${args.path}`, {
                            message: args.message,
                            content: Buffer.from(args.content).toString('base64'),
                            branch: args.branch,
                            sha: args.sha,
                        });
                        break;
                    }
                    case 'push_files': {
                        const args = rawArgs;
                        // This is a simplified example. A full implementation would need to:
                        // 1. Get the latest commit SHA of the target branch
                        // 2. Create a new tree with the new file contents
                        // 3. Create a new commit referencing the new tree and the previous commit
                        // 4. Update the branch reference to the new commit
                        // This requires multiple API calls and more complex logic.
                        // For demonstration, we'll just return a placeholder.
                        return {
                            content: [{ type: 'text', text: 'push_files tool is a placeholder and needs full implementation.' }],
                        };
                    }
                    case 'search_repositories': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get('/search/repositories', {
                            params: { q: args.query, page: args.page, per_page: args.perPage },
                        });
                        break;
                    }
                    case 'create_repository': {
                        const args = rawArgs;
                        response = await this.axiosInstance.post('/user/repos', {
                            name: args.name,
                            description: args.description,
                            private: args.private,
                            auto_init: args.autoInit,
                        });
                        break;
                    }
                    case 'get_file_contents': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/contents/${args.path}`, {
                            params: { ref: args.branch },
                        });
                        // Decode content if it's a file
                        if (response.data.type === 'file' && response.data.content) {
                            response.data.content = Buffer.from(response.data.content, 'base64').toString('utf8');
                        }
                        break;
                    }
                    case 'create_issue': {
                        const args = rawArgs;
                        response = await this.axiosInstance.post(`/repos/${args.owner}/${args.repo}/issues`, {
                            title: args.title,
                            body: args.body,
                            assignees: args.assignees,
                            labels: args.labels,
                            milestone: args.milestone,
                        });
                        break;
                    }
                    case 'create_pull_request': {
                        const args = rawArgs;
                        response = await this.axiosInstance.post(`/repos/${args.owner}/${args.repo}/pulls`, {
                            title: args.title,
                            body: args.body,
                            head: args.head,
                            base: args.base,
                            draft: args.draft,
                            maintainer_can_modify: args.maintainer_can_modify,
                        });
                        break;
                    }
                    case 'fork_repository': {
                        const args = rawArgs;
                        response = await this.axiosInstance.post(`/repos/${args.owner}/${args.repo}/forks`, {
                            organization: args.organization,
                        });
                        break;
                    }
                    case 'create_branch': {
                        const args = rawArgs;
                        // Get the SHA of the base branch
                        const { data: baseBranch } = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/branches/${args.from_branch || 'main'}`);
                        const sha = baseBranch.commit.sha;
                        response = await this.axiosInstance.post(`/repos/${args.owner}/${args.repo}/git/refs`, {
                            ref: `refs/heads/${args.branch}`,
                            sha: sha,
                        });
                        break;
                    }
                    case 'list_commits': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/commits`, {
                            params: { sha: args.sha, page: args.page, per_page: args.perPage },
                        });
                        break;
                    }
                    case 'list_issues': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/issues`, {
                            params: {
                                state: args.state,
                                labels: args.labels ? args.labels.join(',') : undefined,
                                sort: args.sort,
                                direction: args.direction,
                                since: args.since,
                                page: args.page,
                                per_page: args.per_page,
                            },
                        });
                        break;
                    }
                    case 'update_issue': {
                        const args = rawArgs;
                        response = await this.axiosInstance.patch(`/repos/${args.owner}/${args.repo}/issues/${args.issue_number}`, {
                            title: args.title,
                            body: args.body,
                            state: args.state,
                            labels: args.labels,
                            assignees: args.assignees,
                            milestone: args.milestone,
                        });
                        break;
                    }
                    case 'add_issue_comment': {
                        const args = rawArgs;
                        response = await this.axiosInstance.post(`/repos/${args.owner}/${args.repo}/issues/${args.issue_number}/comments`, {
                            body: args.body,
                        });
                        break;
                    }
                    case 'search_code': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get('/search/code', {
                            params: { q: args.q, sort: args.sort, order: args.order, per_page: args.per_page, page: args.page },
                        });
                        break;
                    }
                    case 'search_issues': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get('/search/issues', {
                            params: { q: args.q, sort: args.sort, order: args.order, per_page: args.per_page, page: args.page },
                        });
                        break;
                    }
                    case 'search_users': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get('/search/users', {
                            params: { q: args.q, sort: args.sort, order: args.order, per_page: args.per_page, page: args.page },
                        });
                        break;
                    }
                    case 'get_issue': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/issues/${args.issue_number}`);
                        break;
                    }
                    case 'get_pull_request': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}`);
                        break;
                    }
                    case 'list_pull_requests': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/pulls`, {
                            params: {
                                state: args.state,
                                head: args.head,
                                base: args.base,
                                sort: args.sort,
                                direction: args.direction,
                                per_page: args.per_page,
                                page: args.page,
                            },
                        });
                        break;
                    }
                    case 'create_pull_request_review': {
                        const args = rawArgs;
                        response = await this.axiosInstance.post(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/reviews`, {
                            commit_id: args.commit_id,
                            body: args.body,
                            event: args.event,
                            comments: args.comments,
                        });
                        break;
                    }
                    case 'merge_pull_request': {
                        const args = rawArgs;
                        response = await this.axiosInstance.put(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/merge`, {
                            commit_title: args.commit_title,
                            commit_message: args.commit_message,
                            merge_method: args.merge_method,
                        });
                        break;
                    }
                    case 'get_pull_request_files': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/files`);
                        break;
                    }
                    case 'get_pull_request_status': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/reviews`);
                        break;
                    }
                    case 'update_pull_request_branch': {
                        const args = rawArgs;
                        response = await this.axiosInstance.put(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/update-branch`, {
                            expected_head_sha: args.expected_head_sha,
                        });
                        break;
                    }
                    case 'get_pull_request_comments': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/comments`);
                        break;
                    }
                    case 'get_pull_request_reviews': {
                        const args = rawArgs;
                        response = await this.axiosInstance.get(`/repos/${args.owner}/${args.repo}/pulls/${args.pull_number}/reviews`);
                        break;
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
                return {
                    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
                };
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `GitHub API error: ${error.response?.data.message ?? error.message}`,
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
const server = new GitHubServer();
server.run().catch(console.error);
