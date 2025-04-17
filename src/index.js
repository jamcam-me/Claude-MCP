// filepath: /Claude-MCP/src/index.js
import { FilesystemServer } from './servers/filesystemServer.js';
import { GithubServer } from './servers/githubServer.js';
import { BraveSearchServer } from './servers/braveSearchServer.js';
import { FetchServer } from './servers/fetchServer.js';
import { MindmapServer } from './servers/mindmapServer.js';
import { MarketAnalysisServer } from './servers/marketAnalysisServer.js';
import { FinancialModelingServer } from './servers/financialModelingServer.js';
import { TechnicalDocServer } from './servers/technicalDocServer.js';
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
            technicalDocServer.stop()
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