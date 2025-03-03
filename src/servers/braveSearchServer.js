class BraveSearchServer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.brave.com/search';
    }

    async search(query) {
        const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error('Search request failed');
        }
        return await response.json();
    }

    async getSuggestions(query) {
        const response = await fetch(`${this.baseUrl}/suggestions?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error('Suggestions request failed');
        }
        return await response.json();
    }
}

export default BraveSearchServer;