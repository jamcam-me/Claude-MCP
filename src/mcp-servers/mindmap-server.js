#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

class MindmapServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mindmap-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // Set up resource handlers
    this.setupResourceHandlers();
    
    // Set up tool handlers
    this.setupToolHandlers();
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "mindmap://templates",
            mimeType: "application/json",
            name: "Mindmap Templates",
            description: "Templates for different types of mindmaps"
          },
          {
            uri: "mindmap://examples",
            mimeType: "application/json",
            name: "Mindmap Examples",
            description: "Example mindmaps for reference"
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      switch (uri) {
        case "mindmap://templates": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                templates: [
                  {
                    name: "Business Plan",
                    description: "Template for business plan mindmap",
                    structure: {
                      root: "Business Plan",
                      children: [
                        {
                          name: "Executive Summary",
                          children: ["Mission", "Vision", "Objectives"]
                        },
                        {
                          name: "Market Analysis",
                          children: ["Target Market", "Market Size", "Competitors", "Market Trends"]
                        },
                        {
                          name: "Products/Services",
                          children: ["Description", "Value Proposition", "Pricing", "Development Timeline"]
                        },
                        {
                          name: "Marketing Strategy",
                          children: ["Positioning", "Channels", "Promotion", "Sales Strategy"]
                        },
                        {
                          name: "Financial Plan",
                          children: ["Startup Costs", "Revenue Projections", "Break-even Analysis", "Funding Requirements"]
                        },
                        {
                          name: "Operations",
                          children: ["Team", "Facilities", "Technology", "Processes"]
                        },
                        {
                          name: "Risk Analysis",
                          children: ["Potential Risks", "Mitigation Strategies"]
                        }
                      ]
                    }
                  },
                  {
                    name: "Project Plan",
                    description: "Template for project planning mindmap",
                    structure: {
                      root: "Project Plan",
                      children: [
                        {
                          name: "Goals & Objectives",
                          children: ["Primary Goals", "Success Metrics", "Constraints"]
                        },
                        {
                          name: "Team",
                          children: ["Roles", "Responsibilities", "Communication"]
                        },
                        {
                          name: "Timeline",
                          children: ["Phases", "Milestones", "Dependencies"]
                        },
                        {
                          name: "Resources",
                          children: ["Budget", "Tools", "External Resources"]
                        },
                        {
                          name: "Deliverables",
                          children: ["Key Outputs", "Documentation", "Acceptance Criteria"]
                        },
                        {
                          name: "Risks",
                          children: ["Identified Risks", "Contingency Plans"]
                        }
                      ]
                    }
                  },
                  {
                    name: "Strategic Analysis",
                    description: "Template for strategic analysis mindmap",
                    structure: {
                      root: "Strategic Analysis",
                      children: [
                        {
                          name: "Internal Analysis",
                          children: ["Strengths", "Weaknesses", "Core Competencies", "Resources"]
                        },
                        {
                          name: "External Analysis",
                          children: ["Opportunities", "Threats", "Market Trends", "Competitive Landscape"]
                        },
                        {
                          name: "Strategic Options",
                          children: ["Growth Strategies", "Diversification", "Partnerships", "Innovation"]
                        },
                        {
                          name: "Implementation",
                          children: ["Action Plan", "Resource Allocation", "Timeline", "Responsibilities"]
                        },
                        {
                          name: "Monitoring",
                          children: ["KPIs", "Review Process", "Adjustment Mechanisms"]
                        }
                      ]
                    }
                  }
                ]
              }, null, 2)
            }]
          };
        }
        
        case "mindmap://examples": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                examples: [
                  {
                    name: "Apogee Insights Business Plan",
                    description: "Business plan mindmap for Apogee Insights",
                    mindmap: {
                      root: {
                        name: "Apogee Insights Business Plan",
                        children: [
                          {
                            name: "Executive Summary",
                            children: [
                              { name: "Mission: Transform infrastructure inspection with AI" },
                              { name: "Vision: Global leader in predictive infrastructure analytics" },
                              { name: "Objectives: 50% market share in 5 years" }
                            ]
                          },
                          {
                            name: "Market Analysis",
                            children: [
                              { 
                                name: "Target Market", 
                                children: [
                                  { name: "Utilities" },
                                  { name: "Telecommunications" },
                                  { name: "Energy" }
                                ]
                              },
                              { name: "Market Size: $3.6B globally" },
                              { 
                                name: "Competitors", 
                                children: [
                                  { name: "TowerTech Solutions" },
                                  { name: "InspectAI" },
                                  { name: "GridGuardian" }
                                ]
                              }
                            ]
                          },
                          {
                            name: "Products/Services",
                            children: [
                              { 
                                name: "Tier 1: Essential", 
                                children: [
                                  { name: "Basic inspection" },
                                  { name: "Standard reports" }
                                ]
                              },
                              { 
                                name: "Tier 2: Advanced", 
                                children: [
                                  { name: "Analytics" },
                                  { name: "Asset health scoring" }
                                ]
                              },
                              { 
                                name: "Tier 3: Enterprise", 
                                children: [
                                  { name: "Predictive maintenance" },
                                  { name: "Risk modeling" }
                                ]
                              }
                            ]
                          },
                          {
                            name: "Financial Plan",
                            children: [
                              { name: "Year 1: $4M revenue" },
                              { name: "Year 3: $75M revenue" },
                              { name: "Year 5: $217M revenue" }
                            ]
                          }
                        ]
                      }
                    }
                  }
                ]
              }, null, 2)
            }]
          };
        }
        
        default:
          throw new McpError(
            ErrorCode.ResourceNotFound,
            `Resource not found: ${uri}`
          );
      }
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_mindmap',
          description: 'Create a new mindmap from a template or from scratch',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the mindmap'
              },
              template: {
                type: 'string',
                description: 'Template to use (business_plan, project_plan, strategic_analysis, or none for blank)'
              },
              root_node: {
                type: 'string',
                description: 'Name of the root node (if not using a template)'
              },
              initial_nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    parent: { type: 'string' }
                  }
                },
                description: 'Initial nodes to add to the mindmap (if not using a template)'
              }
            },
            required: ['title'],
          },
        },
        {
          name: 'update_mindmap',
          description: 'Update an existing mindmap by adding, modifying, or removing nodes',
          inputSchema: {
            type: 'object',
            properties: {
              mindmap_id: {
                type: 'string',
                description: 'ID of the mindmap to update'
              },
              add_nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    parent: { type: 'string' }
                  }
                },
                description: 'Nodes to add to the mindmap'
              },
              update_nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                  }
                },
                description: 'Nodes to update in the mindmap'
              },
              remove_nodes: {
                type: 'array',
                items: { type: 'string' },
                description: 'IDs of nodes to remove from the mindmap'
              }
            },
            required: ['mindmap_id'],
          },
        },
        {
          name: 'export_mindmap',
          description: 'Export a mindmap to various formats',
          inputSchema: {
            type: 'object',
            properties: {
              mindmap_id: {
                type: 'string',
                description: 'ID of the mindmap to export'
              },
              format: {
                type: 'string',
                description: 'Format to export to (json, markdown, mermaid)'
              }
            },
            required: ['mindmap_id', 'format'],
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'create_mindmap': {
            const title = request.params.arguments?.title;
            const template = request.params.arguments?.template || 'none';
            const rootNode = request.params.arguments?.root_node || title;
            const initialNodes = request.params.arguments?.initial_nodes || [];
            
            if (!title) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Title is required'
              );
            }
            
            // Generate a unique ID for the mindmap
            const mindmapId = `mm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            // Create mindmap structure based on template
            let mindmap = {
              id: mindmapId,
              title: title,
              created: new Date().toISOString(),
              updated: new Date().toISOString()
            };
            
            if (template === 'business_plan') {
              mindmap.root = {
                id: 'root',
                name: rootNode || 'Business Plan',
                children: [
                  {
                    id: 'exec_summary',
                    name: 'Executive Summary',
                    children: [
                      { id: 'mission', name: 'Mission' },
                      { id: 'vision', name: 'Vision' },
                      { id: 'objectives', name: 'Objectives' }
                    ]
                  },
                  {
                    id: 'market_analysis',
                    name: 'Market Analysis',
                    children: [
                      { id: 'target_market', name: 'Target Market' },
                      { id: 'market_size', name: 'Market Size' },
                      { id: 'competitors', name: 'Competitors' },
                      { id: 'market_trends', name: 'Market Trends' }
                    ]
                  },
                  {
                    id: 'products',
                    name: 'Products/Services',
                    children: [
                      { id: 'description', name: 'Description' },
                      { id: 'value_prop', name: 'Value Proposition' },
                      { id: 'pricing', name: 'Pricing' },
                      { id: 'dev_timeline', name: 'Development Timeline' }
                    ]
                  },
                  {
                    id: 'marketing',
                    name: 'Marketing Strategy',
                    children: [
                      { id: 'positioning', name: 'Positioning' },
                      { id: 'channels', name: 'Channels' },
                      { id: 'promotion', name: 'Promotion' },
                      { id: 'sales', name: 'Sales Strategy' }
                    ]
                  },
                  {
                    id: 'financial',
                    name: 'Financial Plan',
                    children: [
                      { id: 'startup_costs', name: 'Startup Costs' },
                      { id: 'revenue', name: 'Revenue Projections' },
                      { id: 'breakeven', name: 'Break-even Analysis' },
                      { id: 'funding', name: 'Funding Requirements' }
                    ]
                  }
                ]
              };
            } else if (template === 'project_plan') {
              mindmap.root = {
                id: 'root',
                name: rootNode || 'Project Plan',
                children: [
                  {
                    id: 'goals',
                    name: 'Goals & Objectives',
                    children: [
                      { id: 'primary_goals', name: 'Primary Goals' },
                      { id: 'success_metrics', name: 'Success Metrics' },
                      { id: 'constraints', name: 'Constraints' }
                    ]
                  },
                  {
                    id: 'team',
                    name: 'Team',
                    children: [
                      { id: 'roles', name: 'Roles' },
                      { id: 'responsibilities', name: 'Responsibilities' },
                      { id: 'communication', name: 'Communication' }
                    ]
                  },
                  {
                    id: 'timeline',
                    name: 'Timeline',
                    children: [
                      { id: 'phases', name: 'Phases' },
                      { id: 'milestones', name: 'Milestones' },
                      { id: 'dependencies', name: 'Dependencies' }
                    ]
                  },
                  {
                    id: 'resources',
                    name: 'Resources',
                    children: [
                      { id: 'budget', name: 'Budget' },
                      { id: 'tools', name: 'Tools' },
                      { id: 'external', name: 'External Resources' }
                    ]
                  }
                ]
              };
            } else if (template === 'strategic_analysis') {
              mindmap.root = {
                id: 'root',
                name: rootNode || 'Strategic Analysis',
                children: [
                  {
                    id: 'internal',
                    name: 'Internal Analysis',
                    children: [
                      { id: 'strengths', name: 'Strengths' },
                      { id: 'weaknesses', name: 'Weaknesses' },
                      { id: 'competencies', name: 'Core Competencies' },
                      { id: 'resources', name: 'Resources' }
                    ]
                  },
                  {
                    id: 'external',
                    name: 'External Analysis',
                    children: [
                      { id: 'opportunities', name: 'Opportunities' },
                      { id: 'threats', name: 'Threats' },
                      { id: 'trends', name: 'Market Trends' },
                      { id: 'competitive', name: 'Competitive Landscape' }
                    ]
                  },
                  {
                    id: 'options',
                    name: 'Strategic Options',
                    children: [
                      { id: 'growth', name: 'Growth Strategies' },
                      { id: 'diversification', name: 'Diversification' },
                      { id: 'partnerships', name: 'Partnerships' },
                      { id: 'innovation', name: 'Innovation' }
                    ]
                  }
                ]
              };
            } else {
              // Create a blank mindmap with just the root node
              mindmap.root = {
                id: 'root',
                name: rootNode || title,
                children: []
              };
              
              // Add initial nodes if provided
              if (initialNodes.length > 0) {
                const nodeMap = { 'root': mindmap.root };
                
                initialNodes.forEach((node, index) => {
                  const nodeId = `node_${index}`;
                  const newNode = {
                    id: nodeId,
                    name: node.name,
                    children: []
                  };
                  
                  nodeMap[nodeId] = newNode;
                  
                  const parentId = node.parent || 'root';
                  if (nodeMap[parentId]) {
                    if (!nodeMap[parentId].children) {
                      nodeMap[parentId].children = [];
                    }
                    nodeMap[parentId].children.push(newNode);
                  } else {
                    // If parent not found, add to root
                    mindmap.root.children.push(newNode);
                  }
                });
              }
            }
            
            // Generate a Mermaid diagram representation
            const mermaidDiagram = this.generateMermaidDiagram(mindmap);
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  mindmap_id: mindmapId,
                  title: title,
                  structure: mindmap,
                  mermaid_diagram: mermaidDiagram
                }, null, 2)
              }]
            };
          }
          
          case 'update_mindmap': {
            const mindmapId = request.params.arguments?.mindmap_id;
            const addNodes = request.params.arguments?.add_nodes || [];
            const updateNodes = request.params.arguments?.update_nodes || [];
            const removeNodes = request.params.arguments?.remove_nodes || [];
            
            if (!mindmapId) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Mindmap ID is required'
              );
            }
            
            // In a real implementation, we would retrieve the mindmap from storage
            // For this example, we'll create a sample mindmap to update
            const mindmap = {
              id: mindmapId,
              title: "Sample Mindmap",
              created: "2025-04-14T12:00:00Z",
              updated: new Date().toISOString(),
              root: {
                id: 'root',
                name: 'Sample Mindmap',
                children: [
                  {
                    id: 'node1',
                    name: 'Node 1',
                    children: [
                      { id: 'node1_1', name: 'Node 1.1', children: [] },
                      { id: 'node1_2', name: 'Node 1.2', children: [] }
                    ]
                  },
                  {
                    id: 'node2',
                    name: 'Node 2',
                    children: [
                      { id: 'node2_1', name: 'Node 2.1', children: [] }
                    ]
                  }
                ]
              }
            };
            
            // Create a map of all nodes for easy access
            const nodeMap = {};
            const mapNodes = (node) => {
              nodeMap[node.id] = node;
              if (node.children) {
                node.children.forEach(mapNodes);
              }
            };
            mapNodes(mindmap.root);
            
            // Update nodes
            updateNodes.forEach(update => {
              if (nodeMap[update.id]) {
                nodeMap[update.id].name = update.name;
              }
            });
            
            // Add nodes
            addNodes.forEach((node, index) => {
              const nodeId = `new_node_${index}`;
              const newNode = {
                id: nodeId,
                name: node.name,
                children: []
              };
              
              nodeMap[nodeId] = newNode;
              
              const parentId = node.parent || 'root';
              if (nodeMap[parentId]) {
                if (!nodeMap[parentId].children) {
                  nodeMap[parentId].children = [];
                }
                nodeMap[parentId].children.push(newNode);
              }
            });
            
            // Remove nodes
            removeNodes.forEach(nodeId => {
              if (nodeId === 'root') {
                // Can't remove root node
                return;
              }
              
              // Find the parent node
              for (const id in nodeMap) {
                const node = nodeMap[id];
                if (node.children) {
                  const index = node.children.findIndex(child => child.id === nodeId);
                  if (index !== -1) {
                    node.children.splice(index, 1);
                    delete nodeMap[nodeId];
                    break;
                  }
                }
              }
            });
            
            // Generate a Mermaid diagram representation
            const mermaidDiagram = this.generateMermaidDiagram(mindmap);
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  mindmap_id: mindmapId,
                  title: mindmap.title,
                  structure: mindmap,
                  mermaid_diagram: mermaidDiagram
                }, null, 2)
              }]
            };
          }
          
          case 'export_mindmap': {
            const mindmapId = request.params.arguments?.mindmap_id;
            const format = request.params.arguments?.format || 'json';
            
            if (!mindmapId) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Mindmap ID is required'
              );
            }
            
            // In a real implementation, we would retrieve the mindmap from storage
            // For this example, we'll create a sample mindmap to export
            const mindmap = {
              id: mindmapId,
              title: "Sample Mindmap for Export",
              created: "2025-04-14T12:00:00Z",
              updated: "2025-04-14T14:30:00Z",
              root: {
                id: 'root',
                name: 'Sample Mindmap',
                children: [
                  {
                    id: 'node1',
                    name: 'Category 1',
                    children: [
                      { id: 'node1_1', name: 'Item 1.1', children: [] },
                      { id: 'node1_2', name: 'Item 1.2', children: [] }
                    ]
                  },
                  {
                    id: 'node2',
                    name: 'Category 2',
                    children: [
                      { id: 'node2_1', name: 'Item 2.1', children: [] },
                      { 
                        id: 'node2_2', 
                        name: 'Item 2.2', 
                        children: [
                          { id: 'node2_2_1', name: 'Subitem 2.2.1', children: [] }
                        ] 
                      }
                    ]
                  }
                ]
              }
            };
            
            let exportContent;
            
            if (format === 'json') {
              // Export as JSON
              exportContent = JSON.stringify(mindmap, null, 2);
            } else if (format === 'markdown') {
              // Export as Markdown
              exportContent = this.generateMarkdown(mindmap);
            } else if (format === 'mermaid') {
              // Export as Mermaid diagram
              exportContent = this.generateMermaidDiagram(mindmap);
            } else {
              throw new McpError(
                ErrorCode.InvalidParams,
                `Unsupported export format: ${format}`
              );
            }
            
            return {
              content: [{
                type: "text",
                text: exportContent
              }]
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Mindmap operation error: ${error.message}`
        );
      }
    });
  }

  // Helper method to generate a Markdown representation of a mindmap
  generateMarkdown(mindmap) {
    let markdown = `# ${mindmap.title}\n\n`;
    
    const processNode = (node, level) => {
      const indent = '  '.repeat(level);
      markdown += `${indent}- ${node.name}\n`;
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => processNode(child, level + 1));
      }
    };
    
    processNode(mindmap.root, 0);
    
    return markdown;
  }
  
  // Helper method to generate a Mermaid diagram representation of a mindmap
  generateMermaidDiagram(mindmap) {
    let mermaid = `mindmap\n  root${mindmap.root.id}(${mindmap.root.name})\n`;
    
    const processNode = (node, parentId) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          mermaid += `    ${parentId} --> ${child.id}(${child.name})\n`;
          processNode(child, child.id);
        });
      }
    };
    
    processNode(mindmap.root, `root${mindmap.root.id}`);
    
    return mermaid;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mindmap MCP server running on stdio');
  }
}

const server = new MindmapServer();
server.run().catch(console.error);