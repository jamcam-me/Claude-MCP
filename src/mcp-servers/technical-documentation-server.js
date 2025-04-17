#!/usr/bin/env node

/**
 * Technical Documentation MCP Server for Apogee Insights
 * 
 * This server provides tools for generating technical documentation and diagrams,
 * including architecture diagrams, sequence diagrams, and Gantt charts.
 */

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

class TechnicalDocumentationServer {
  constructor() {
    this.server = new Server(
      {
        name: 'technical-documentation-server',
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
            uri: "technical-docs://architecture-templates",
            mimeType: "application/json",
            name: "Architecture Templates",
            description: "Architecture diagram templates"
          },
          {
            uri: "technical-docs://sequence-templates",
            mimeType: "application/json",
            name: "Sequence Templates",
            description: "Sequence diagram templates"
          },
          {
            uri: "technical-docs://gantt-templates",
            mimeType: "application/json",
            name: "Gantt Templates",
            description: "Gantt chart templates"
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      switch (uri) {
        case "technical-docs://architecture-templates": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                templates: [
                  {
                    name: "System Architecture",
                    description: "High-level system architecture diagram",
                    mermaid_code: this.getArchitectureTemplate()
                  },
                  {
                    name: "Data Flow",
                    description: "Data flow diagram",
                    mermaid_code: this.getDataFlowTemplate()
                  }
                ]
              }, null, 2)
            }]
          };
        }
        
        case "technical-docs://sequence-templates": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                templates: [
                  {
                    name: "API Request",
                    description: "API request sequence diagram",
                    mermaid_code: this.getAPIRequestTemplate()
                  },
                  {
                    name: "User Authentication",
                    description: "User authentication sequence diagram",
                    mermaid_code: this.getAuthenticationTemplate()
                  }
                ]
              }, null, 2)
            }]
          };
        }
        
        case "technical-docs://gantt-templates": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                templates: [
                  {
                    name: "Project Timeline",
                    description: "Project timeline Gantt chart",
                    mermaid_code: this.getProjectTimelineTemplate()
                  },
                  {
                    name: "Sprint Planning",
                    description: "Sprint planning Gantt chart",
                    mermaid_code: this.getSprintPlanningTemplate()
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
          name: 'generate_architecture_diagram',
          description: 'Generate architecture diagrams based on system components',
          inputSchema: {
            type: 'object',
            properties: {
              diagram_type: {
                type: 'string',
                description: 'Type of diagram (flowchart, sequence, etc.)',
                enum: ['flowchart', 'sequence', 'class', 'gantt']
              },
              direction: {
                type: 'string',
                description: 'Direction of the flowchart (TB, BT, LR, RL)',
                enum: ['TB', 'BT', 'LR', 'RL']
              },
              components: {
                type: 'array',
                description: 'Array of components to include in the diagram',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' },
                    description: { type: 'string' },
                    components: {
                      type: 'array',
                      items: { type: 'object' }
                    }
                  },
                  required: ['id', 'name']
                }
              },
              relationships: {
                type: 'array',
                description: 'Array of relationships between components',
                items: {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    label: { type: 'string' }
                  },
                  required: ['from', 'to']
                }
              }
            },
            required: ['diagram_type', 'components']
          },
        },
        {
          name: 'generate_sequence_diagram',
          description: 'Generate sequence diagrams for system interactions',
          inputSchema: {
            type: 'object',
            properties: {
              participants: {
                type: 'array',
                description: 'Array of participants in the sequence diagram',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' }
                  },
                  required: ['id', 'name']
                }
              },
              interactions: {
                type: 'array',
                description: 'Array of interactions between participants',
                items: {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    message: { type: 'string' },
                    type: { type: 'string' }
                  },
                  required: ['from', 'to', 'message']
                }
              }
            },
            required: ['participants', 'interactions']
          },
        },
        {
          name: 'generate_gantt_chart',
          description: 'Generate Gantt charts for project timelines',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the Gantt chart'
              },
              date_format: {
                type: 'string',
                description: 'Date format for the Gantt chart'
              },
              sections: {
                type: 'array',
                description: 'Array of sections in the Gantt chart',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    tasks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          start: { type: 'string' },
                          end: { type: 'string' },
                          duration: { type: 'string' },
                          dependencies: {
                            type: 'array',
                            items: { type: 'string' }
                          }
                        },
                        required: ['name']
                      }
                    }
                  },
                  required: ['name', 'tasks']
                }
              }
            },
            required: ['sections']
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'generate_architecture_diagram': {
            const diagramType = request.params.arguments?.diagram_type || 'flowchart';
            const direction = request.params.arguments?.direction || 'TB';
            const components = request.params.arguments?.components || [];
            const relationships = request.params.arguments?.relationships || [];
            
            if (!components || components.length === 0) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Components are required'
              );
            }
            
            // Generate architecture diagram
            const mermaidCode = this.generateArchitectureDiagram(diagramType, direction, components, relationships);
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  mermaid_code: mermaidCode
                }, null, 2)
              }]
            };
          }
          
          case 'generate_sequence_diagram': {
            const participants = request.params.arguments?.participants || [];
            const interactions = request.params.arguments?.interactions || [];
            
            if (!participants || participants.length === 0 || !interactions || interactions.length === 0) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Participants and interactions are required'
              );
            }
            
            // Generate sequence diagram
            const mermaidCode = this.generateSequenceDiagram(participants, interactions);
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  mermaid_code: mermaidCode
                }, null, 2)
              }]
            };
          }
          
          case 'generate_gantt_chart': {
            const title = request.params.arguments?.title;
            const dateFormat = request.params.arguments?.date_format || 'YYYY-MM-DD';
            const sections = request.params.arguments?.sections || [];
            
            if (!sections || sections.length === 0) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Sections are required'
              );
            }
            
            // Generate Gantt chart
            const mermaidCode = this.generateGanttChart(title, dateFormat, sections);
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  mermaid_code: mermaidCode
                }, null, 2)
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
          `Technical documentation operation error: ${error.message}`
        );
      }
    });
  }

  // Tool implementation functions
  generateArchitectureDiagram(diagramType, direction, components, relationships) {
    let mermaidCode = `${diagramType} ${direction}\n`;
    
    // Add components
    components.forEach((component) => {
      if (component.type === 'subgraph') {
        mermaidCode += `    subgraph ${component.id}[${component.name}]\n`;
        
        // Add subcomponents
        if (component.components && component.components.length > 0) {
          component.components.forEach((subcomponent) => {
            const description = subcomponent.description ? `\\n${subcomponent.description}` : '';
            mermaidCode += `        ${subcomponent.id}[${subcomponent.name}${description}]\n`;
          });
        }
        
        mermaidCode += `    end\n\n`;
      } else {
        const description = component.description ? `\\n${component.description}` : '';
        mermaidCode += `    ${component.id}[${component.name}${description}]\n`;
      }
    });
    
    // Add relationships
    if (relationships.length > 0) {
      mermaidCode += '\n';
      relationships.forEach((rel) => {
        const label = rel.label ? `|${rel.label}|` : '';
        mermaidCode += `    ${rel.from} -->${label} ${rel.to}\n`;
      });
    }
    
    return mermaidCode;
  }

  generateSequenceDiagram(participants, interactions) {
    let mermaidCode = 'sequenceDiagram\n';
    
    // Add participants
    participants.forEach((participant) => {
      const type = participant.type || 'participant';
      mermaidCode += `    ${type} ${participant.id} as ${participant.name}\n`;
    });
    
    // Add interactions
    if (interactions.length > 0) {
      mermaidCode += '\n';
      interactions.forEach((interaction) => {
        const type = interaction.type || '->>';
        mermaidCode += `    ${interaction.from}${type}${interaction.to}: ${interaction.message}\n`;
      });
    }
    
    return mermaidCode;
  }

  generateGanttChart(title, dateFormat, sections) {
    let mermaidCode = 'gantt\n';
    
    // Add title and date format
    if (title) {
      mermaidCode += `    title ${title}\n`;
    }
    mermaidCode += `    dateFormat ${dateFormat}\n`;
    
    // Add sections and tasks
    sections.forEach((section) => {
      mermaidCode += `    section ${section.name}\n`;
      
      section.tasks.forEach((task) => {
        let taskLine = `    ${task.name} :`;
        
        if (task.dependencies && task.dependencies.length > 0) {
          taskLine += `after ${task.dependencies.join(', ')}, `;
        }
        
        if (task.start && task.end) {
          taskLine += `${task.start}, ${task.end}`;
        } else if (task.duration) {
          taskLine += `${task.duration}`;
        }
        
        mermaidCode += `${taskLine}\n`;
      });
    });
    
    return mermaidCode;
  }

  // Template functions
  getArchitectureTemplate() {
    return `flowchart TB
    subgraph client[Client Layer]
        browser[Web Browser]
        mobile[Mobile App]
    end
    
    subgraph api[API Layer]
        gateway[API Gateway]
        auth[Authentication]
        services[Microservices]
    end
    
    subgraph data[Data Layer]
        db[Database]
        cache[Cache]
        storage[File Storage]
    end
    
    browser --> gateway
    mobile --> gateway
    gateway --> auth
    auth --> services
    services --> db
    services --> cache
    services --> storage`;
  }

  getDataFlowTemplate() {
    return `flowchart LR
    source[Data Source] --> collect[Data Collection]
    collect --> process[Data Processing]
    process --> analyze[Data Analysis]
    analyze --> store[Data Storage]
    analyze --> visualize[Data Visualization]
    store --> api[API]
    api --> consume[Data Consumption]`;
  }

  getAPIRequestTemplate() {
    return `sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant Service
    participant Database
    
    Client->>Gateway: Request
    Gateway->>Auth: Authenticate
    Auth->>Gateway: Token
    Gateway->>Service: Forward Request
    Service->>Database: Query
    Database->>Service: Results
    Service->>Gateway: Response
    Gateway->>Client: Response`;
  }

  getAuthenticationTemplate() {
    return `sequenceDiagram
    participant User
    participant Client
    participant Auth
    participant Database
    
    User->>Client: Login
    Client->>Auth: Credentials
    Auth->>Database: Verify
    Database->>Auth: User Data
    Auth->>Client: Token
    Client->>User: Success`;
  }

  getProjectTimelineTemplate() {
    return `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
      Requirements Analysis :2025-04-01, 2025-04-15
      System Design        :2025-04-16, 2025-04-30
    section Development
      Frontend Implementation :2025-05-01, 2025-05-31
      Backend Implementation  :2025-05-01, 2025-05-31
      Integration             :2025-06-01, 2025-06-15
    section Testing
      Unit Testing    :2025-06-16, 2025-06-30
      System Testing  :2025-07-01, 2025-07-15
      User Acceptance :2025-07-16, 2025-07-31
    section Deployment
      Staging      :2025-08-01, 2025-08-15
      Production   :2025-08-16, 2025-08-31`;
  }

  getSprintPlanningTemplate() {
    return `gantt
    title Sprint Planning
    dateFormat YYYY-MM-DD
    section Sprint 1
      Task 1 :a1, 2025-04-01, 3d
      Task 2 :a2, after a1, 2d
      Task 3 :a3, after a2, 4d
    section Sprint 2
      Task 4 :b1, 2025-04-15, 2d
      Task 5 :b2, after b1, 3d
      Task 6 :b3, after b2, 4d`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Technical Documentation MCP server running on stdio');
  }
}

const server = new TechnicalDocumentationServer();
server.run().catch(console.error);