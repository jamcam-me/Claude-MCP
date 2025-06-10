#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { VercelApiMcp } from './src/mcp-servers/vercel-api-mcp.js';

const server = new VercelApiMcp();
server.run().catch(console.error);