// filepath: /Claude-MCP/src/index.js
import { FilesystemServer } from './mcp-servers/filesystem-server.js';
import { GithubServer } from './mcp-servers/github-server/index.js';
import { BraveSearchServer } from './mcp-servers/brave-search-server.js';
import { FetchServer } from './mcp-servers/fetch-server.js';
import { MindmapServer } from './mcp-servers/mindmap-server.js';
import { MarketAnalysisServer } from './mcp-servers/market-analysis-server.js';
import { FinancialModelingServer } from './mcp-servers/financial-modeling-server.js';
import { TechnicalDocServer } from './mcp-servers/technical-documentation-server.js';
import { VercelApiMcp } from './mcp-servers/vercel-api-mcp.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize all servers
const filesystemServer = new FilesystemServer();
const githubServer = new GithubServer();
const braveSearchServer = new BraveSearchServer();
const fetchServer = new FetchServer();
const mindmapServer = new MindmapServer();
const marketAnalysisServer = new MarketAnalysisServer();
const financialModelingServer = new FinancialModelingServer();
const technicalDocServer = new TechnicalDocServer();
const vercelApiMcpServer = new VercelApiMcp();

const startServers = async () => {
    try {
        console.log('Starting all MCP servers...');
        
        // Start existing servers
        await filesystemServer.start();
        await githubServer.start();
        await braveSearchServer.start();
        
        // Start new servers
        await fetchServer.start();
        await mindmapServer.start();
        await marketAnalysisServer.start();
        
        // Start existing servers that were added to the repository
        await financialModelingServer.start();
        await technicalDocServer.start();
        await vercelApiMcpServer.start();
        
        console.log('All MCP servers started successfully');
    } catch (error) {
        console.error('Error starting servers:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down all MCP servers...');
    
    try {
        // Shutdown all servers
        await Promise.all([
            filesystemServer.stop(),
            githubServer.stop(),
            braveSearchServer.stop(),
            fetchServer.stop(),
            mindmapServer.stop(),
            marketAnalysisServer.stop(),
            financialModelingServer.stop(),
            technicalDocServer.stop(),
            vercelApiMcpServer.stop()
        ]);
        
        console.log('All MCP servers stopped successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error stopping servers:', error);
        process.exit(1);
    }
});

startServers().catch(err => {
    console.error('Error starting servers:', err);
    process.exit(1);
});