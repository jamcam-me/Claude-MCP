// filepath: /Claude-SCP/Claude-SCP/src/index.js
import { FilesystemServer } from './servers/filesystemServer.js';
import { GithubServer } from './servers/githubServer.js';
import { BraveSearchServer } from './servers/braveSearchServer.js';
import dotenv from 'dotenv';

dotenv.config();

const filesystemServer = new FilesystemServer();
const githubServer = new GithubServer();
const braveSearchServer = new BraveSearchServer();

const startServers = async () => {
    await filesystemServer.start();
    await githubServer.start();
    await braveSearchServer.start();
};

startServers().catch(err => {
    console.error('Error starting servers:', err);
});