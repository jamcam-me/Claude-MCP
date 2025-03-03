class GithubServer {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.baseUrl = 'https://api.github.com';
    }

    async fetchRepositories(username) {
        const response = await fetch(`${this.baseUrl}/users/${username}/repos`, {
            headers: {
                'Authorization': `token ${this.apiToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.json();
    }

    async fetchIssues(owner, repo) {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
            headers: {
                'Authorization': `token ${this.apiToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.json();
    }

    async fetchPullRequests(owner, repo) {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
            headers: {
                'Authorization': `token ${this.apiToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.json();
    }
}

export default GithubServer;