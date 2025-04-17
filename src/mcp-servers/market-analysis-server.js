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

class MarketAnalysisServer {
  constructor() {
    this.server = new Server(
      {
        name: 'market-analysis-server',
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
            uri: "market-analysis://partner-ecosystem",
            mimeType: "application/json",
            name: "Partner Ecosystem",
            description: "Partner ecosystem analysis and visualization data"
          },
          {
            uri: "market-analysis://competitive-landscape",
            mimeType: "application/json",
            name: "Competitive Landscape",
            description: "Competitive landscape analysis and visualization data"
          },
          {
            uri: "market-analysis://regional-markets",
            mimeType: "application/json",
            name: "Regional Markets",
            description: "Regional market analysis and visualization data"
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      switch (uri) {
        case "market-analysis://partner-ecosystem": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                partnerCategories: [
                  {
                    name: "Technology Providers",
                    partners: [
                      { name: "Cloud Infrastructure", count: 5, regions: ["NA", "EMEA", "APAC"] },
                      { name: "Data Analytics", count: 8, regions: ["NA", "EMEA", "APAC", "LATAM"] },
                      { name: "AI/ML Solutions", count: 12, regions: ["NA", "EMEA", "APAC"] }
                    ]
                  },
                  {
                    name: "Service Providers",
                    partners: [
                      { name: "Implementation", count: 15, regions: ["NA", "EMEA", "APAC", "LATAM", "MEA"] },
                      { name: "Consulting", count: 10, regions: ["NA", "EMEA", "APAC"] },
                      { name: "Training", count: 7, regions: ["NA", "EMEA", "APAC", "LATAM"] }
                    ]
                  },
                  {
                    name: "Industry Partners",
                    partners: [
                      { name: "Utilities", count: 20, regions: ["NA", "EMEA", "APAC", "LATAM", "MEA"] },
                      { name: "Telecommunications", count: 18, regions: ["NA", "EMEA", "APAC", "LATAM"] },
                      { name: "Energy", count: 15, regions: ["NA", "EMEA", "APAC", "MEA"] }
                    ]
                  }
                ],
                regionDistribution: {
                  "NA": 0.35,
                  "EMEA": 0.30,
                  "APAC": 0.20,
                  "LATAM": 0.10,
                  "MEA": 0.05
                }
              }, null, 2)
            }]
          };
        }
        
        case "market-analysis://competitive-landscape": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                competitors: [
                  {
                    name: "TowerTech Solutions",
                    marketShare: 0.25,
                    strengths: ["Established market presence", "Wide geographic coverage"],
                    weaknesses: ["Legacy technology", "Higher pricing"]
                  },
                  {
                    name: "InspectAI",
                    marketShare: 0.15,
                    strengths: ["Advanced AI capabilities", "Modern platform"],
                    weaknesses: ["Limited geographic presence", "Newer entrant"]
                  },
                  {
                    name: "GridGuardian",
                    marketShare: 0.10,
                    strengths: ["Strong utility relationships", "Comprehensive reporting"],
                    weaknesses: ["Limited analytics", "Slower innovation cycle"]
                  },
                  {
                    name: "Apogee Insights",
                    marketShare: 0.05,
                    strengths: ["Cutting-edge technology", "Flexible pricing", "Predictive capabilities"],
                    weaknesses: ["Building market presence", "Expanding partner network"]
                  },
                  {
                    name: "Others",
                    marketShare: 0.45,
                    strengths: ["Varied specializations", "Local market knowledge"],
                    weaknesses: ["Fragmented offerings", "Scale limitations"]
                  }
                ],
                featureComparison: {
                  "Basic Inspection": [true, true, true, true, true],
                  "Standard Reports": [true, true, true, true, true],
                  "Advanced Analytics": [false, true, false, true, false],
                  "Asset Health Scoring": [true, true, false, true, false],
                  "Predictive Maintenance": [false, true, false, true, false],
                  "Risk Modeling": [false, false, false, true, false],
                  "API Integration": [true, true, false, true, false],
                  "Mobile Support": [true, true, true, true, false]
                }
              }, null, 2)
            }]
          };
        }
        
        case "market-analysis://regional-markets": {
          return {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify({
                regions: [
                  {
                    name: "North America",
                    marketSize: 1200000000,
                    growthRate: 0.08,
                    keyMarkets: ["USA", "Canada"],
                    penetration: 0.12
                  },
                  {
                    name: "Europe, Middle East, Africa",
                    marketSize: 950000000,
                    growthRate: 0.07,
                    keyMarkets: ["UK", "Germany", "France", "UAE", "South Africa"],
                    penetration: 0.09
                  },
                  {
                    name: "Asia Pacific",
                    marketSize: 850000000,
                    growthRate: 0.12,
                    keyMarkets: ["China", "Japan", "Australia", "India"],
                    penetration: 0.06
                  },
                  {
                    name: "Latin America",
                    marketSize: 350000000,
                    growthRate: 0.09,
                    keyMarkets: ["Brazil", "Mexico", "Colombia"],
                    penetration: 0.04
                  },
                  {
                    name: "Middle East & Africa",
                    marketSize: 250000000,
                    growthRate: 0.11,
                    keyMarkets: ["Saudi Arabia", "UAE", "South Africa"],
                    penetration: 0.03
                  }
                ],
                totalMarketSize: 3600000000,
                globalGrowthRate: 0.09
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
          name: 'partner_ecosystem_analysis',
          description: 'Analyze partner ecosystem and generate visualization data',
          inputSchema: {
            type: 'object',
            properties: {
              partner_categories: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Categories of partners to analyze'
              },
              region: {
                type: 'string',
                description: 'Geographic region to focus on'
              }
            },
            required: ['partner_categories'],
          },
        },
        {
          name: 'competitive_analysis',
          description: 'Analyze competitive landscape and generate visualization data',
          inputSchema: {
            type: 'object',
            properties: {
              competitors: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Competitors to include in the analysis'
              },
              features: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Features to compare across competitors'
              }
            },
            required: ['competitors'],
          },
        },
        {
          name: 'regional_market_analysis',
          description: 'Analyze regional markets and generate visualization data',
          inputSchema: {
            type: 'object',
            properties: {
              regions: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Regions to include in the analysis'
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Metrics to analyze (market_size, growth_rate, penetration)'
              }
            },
            required: ['regions'],
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'partner_ecosystem_analysis': {
            const partnerCategories = request.params.arguments?.partner_categories || [];
            const region = request.params.arguments?.region;
            
            // Get partner ecosystem data
            const partnerData = {
              "Technology Providers": {
                partners: [
                  { name: "Cloud Infrastructure", count: 5, regions: ["NA", "EMEA", "APAC"] },
                  { name: "Data Analytics", count: 8, regions: ["NA", "EMEA", "APAC", "LATAM"] },
                  { name: "AI/ML Solutions", count: 12, regions: ["NA", "EMEA", "APAC"] }
                ]
              },
              "Service Providers": {
                partners: [
                  { name: "Implementation", count: 15, regions: ["NA", "EMEA", "APAC", "LATAM", "MEA"] },
                  { name: "Consulting", count: 10, regions: ["NA", "EMEA", "APAC"] },
                  { name: "Training", count: 7, regions: ["NA", "EMEA", "APAC", "LATAM"] }
                ]
              },
              "Industry Partners": {
                partners: [
                  { name: "Utilities", count: 20, regions: ["NA", "EMEA", "APAC", "LATAM", "MEA"] },
                  { name: "Telecommunications", count: 18, regions: ["NA", "EMEA", "APAC", "LATAM"] },
                  { name: "Energy", count: 15, regions: ["NA", "EMEA", "APAC", "MEA"] }
                ]
              }
            };
            
            // Filter by categories and region
            const filteredData = {};
            for (const category of partnerCategories) {
              if (partnerData[category]) {
                if (region) {
                  filteredData[category] = {
                    partners: partnerData[category].partners.filter(p => p.regions.includes(region))
                  };
                } else {
                  filteredData[category] = partnerData[category];
                }
              }
            }
            
            // Generate visualization data
            const visualizationData = {
              chartType: "bar",
              title: `Partner Ecosystem Analysis${region ? ` - ${region}` : ''}`,
              categories: Object.keys(filteredData),
              data: Object.entries(filteredData).map(([category, data]) => ({
                category,
                partnerCount: data.partners.reduce((sum, p) => sum + p.count, 0),
                partners: data.partners.map(p => p.name)
              }))
            };
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify(visualizationData, null, 2)
              }]
            };
          }
          
          case 'competitive_analysis': {
            const competitors = request.params.arguments?.competitors || [];
            const features = request.params.arguments?.features || [];
            
            // Get competitor data
            const competitorData = {
              "TowerTech Solutions": {
                marketShare: 0.25,
                strengths: ["Established market presence", "Wide geographic coverage"],
                weaknesses: ["Legacy technology", "Higher pricing"],
                features: {
                  "Basic Inspection": true,
                  "Standard Reports": true,
                  "Advanced Analytics": false,
                  "Asset Health Scoring": true,
                  "Predictive Maintenance": false,
                  "Risk Modeling": false,
                  "API Integration": true,
                  "Mobile Support": true
                }
              },
              "InspectAI": {
                marketShare: 0.15,
                strengths: ["Advanced AI capabilities", "Modern platform"],
                weaknesses: ["Limited geographic presence", "Newer entrant"],
                features: {
                  "Basic Inspection": true,
                  "Standard Reports": true,
                  "Advanced Analytics": true,
                  "Asset Health Scoring": true,
                  "Predictive Maintenance": true,
                  "Risk Modeling": false,
                  "API Integration": true,
                  "Mobile Support": true
                }
              },
              "GridGuardian": {
                marketShare: 0.10,
                strengths: ["Strong utility relationships", "Comprehensive reporting"],
                weaknesses: ["Limited analytics", "Slower innovation cycle"],
                features: {
                  "Basic Inspection": true,
                  "Standard Reports": true,
                  "Advanced Analytics": false,
                  "Asset Health Scoring": false,
                  "Predictive Maintenance": false,
                  "Risk Modeling": false,
                  "API Integration": false,
                  "Mobile Support": true
                }
              },
              "Apogee Insights": {
                marketShare: 0.05,
                strengths: ["Cutting-edge technology", "Flexible pricing", "Predictive capabilities"],
                weaknesses: ["Building market presence", "Expanding partner network"],
                features: {
                  "Basic Inspection": true,
                  "Standard Reports": true,
                  "Advanced Analytics": true,
                  "Asset Health Scoring": true,
                  "Predictive Maintenance": true,
                  "Risk Modeling": true,
                  "API Integration": true,
                  "Mobile Support": true
                }
              }
            };
            
            // Filter by competitors
            const filteredCompetitors = {};
            for (const competitor of competitors) {
              if (competitorData[competitor]) {
                filteredCompetitors[competitor] = competitorData[competitor];
              }
            }
            
            // Generate visualization data
            const visualizationData = {
              marketShareChart: {
                chartType: "pie",
                title: "Market Share Analysis",
                labels: Object.keys(filteredCompetitors),
                data: Object.values(filteredCompetitors).map(c => c.marketShare)
              },
              featureComparisonChart: {
                chartType: "matrix",
                title: "Feature Comparison",
                competitors: Object.keys(filteredCompetitors),
                features: features.length > 0 ? features : Object.keys(competitorData.InspectAI.features),
                data: Object.entries(filteredCompetitors).map(([name, data]) => ({
                  name,
                  features: features.length > 0 
                    ? features.map(f => data.features[f] || false)
                    : Object.values(data.features)
                }))
              }
            };
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify(visualizationData, null, 2)
              }]
            };
          }
          
          case 'regional_market_analysis': {
            const regions = request.params.arguments?.regions || [];
            const metrics = request.params.arguments?.metrics || ["market_size", "growth_rate", "penetration"];
            
            // Get regional market data
            const regionData = {
              "North America": {
                marketSize: 1200000000,
                growthRate: 0.08,
                penetration: 0.12
              },
              "Europe, Middle East, Africa": {
                marketSize: 950000000,
                growthRate: 0.07,
                penetration: 0.09
              },
              "Asia Pacific": {
                marketSize: 850000000,
                growthRate: 0.12,
                penetration: 0.06
              },
              "Latin America": {
                marketSize: 350000000,
                growthRate: 0.09,
                penetration: 0.04
              },
              "Middle East & Africa": {
                marketSize: 250000000,
                growthRate: 0.11,
                penetration: 0.03
              }
            };
            
            // Filter by regions
            const filteredRegions = {};
            for (const region of regions) {
              if (regionData[region]) {
                filteredRegions[region] = regionData[region];
              }
            }
            
            // If no regions specified, use all
            const regionsToAnalyze = Object.keys(filteredRegions).length > 0 
              ? filteredRegions 
              : regionData;
            
            // Generate visualization data
            const visualizationData = {
              charts: metrics.map(metric => {
                const metricName = metric === "market_size" 
                  ? "Market Size" 
                  : metric === "growth_rate" 
                    ? "Growth Rate" 
                    : "Market Penetration";
                
                return {
                  chartType: "bar",
                  title: `Regional ${metricName}`,
                  labels: Object.keys(regionsToAnalyze),
                  data: Object.values(regionsToAnalyze).map(r => {
                    if (metric === "market_size") {
                      return r.marketSize;
                    } else if (metric === "growth_rate") {
                      return r.growthRate;
                    } else {
                      return r.penetration;
                    }
                  })
                };
              })
            };
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify(visualizationData, null, 2)
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
          `Market analysis operation error: ${error.message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Market Analysis MCP server running on stdio');
  }
}

const server = new MarketAnalysisServer();
server.run().catch(console.error);