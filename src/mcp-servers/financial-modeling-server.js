#!/usr/bin/env node

/**
 * Financial Modeling MCP Server for Apogee Insights
 * 
 * This server provides tools and resources for financial modeling,
 * including revenue projections, scenario analysis, and sensitivity analysis.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Financial model data
 */
const pricingTiers = {
  essential: {
    name: "Tier 1: Essential",
    dataCollectionFee: 610,
    saasFee: 200,
    totalPerTower: 810,
    features: ["Basic inspection & standard reports"]
  },
  advanced: {
    name: "Tier 2: Advanced",
    dataCollectionFee: 610,
    saasFee: 350,
    totalPerTower: 960,
    features: ["Basic inspection & standard reports", "Analytics", "Asset health scoring"]
  },
  enterprise: {
    name: "Tier 3: Enterprise",
    dataCollectionFee: 610,
    saasFee: 500,
    totalPerTower: 1110,
    features: ["Basic inspection & standard reports", "Analytics", "Asset health scoring", "Predictive maintenance", "Risk modeling"]
  }
};

const tierDistribution = {
  1: { essential: 0.8, advanced: 0.15, enterprise: 0.05, blendedSaasPrice: 225.00 },
  2: { essential: 0.7, advanced: 0.2, enterprise: 0.1, blendedSaasPrice: 245.00 },
  3: { essential: 0.6, advanced: 0.25, enterprise: 0.15, blendedSaasPrice: 267.50 },
  4: { essential: 0.5, advanced: 0.3, enterprise: 0.2, blendedSaasPrice: 290.00 },
  5: { essential: 0.4, advanced: 0.35, enterprise: 0.25, blendedSaasPrice: 312.50 }
};

const marketData = {
  1: { marketShare: 0.05, totalKm: 95560, totalTowers: 382240, towersInspected: 4778, dailyCapacity: 25 },
  2: { marketShare: 0.10, totalKm: 100338, totalTowers: 401352, towersInspected: 40135, dailyCapacity: 25 },
  3: { marketShare: 0.20, totalKm: 105355, totalTowers: 421420, towersInspected: 84284, dailyCapacity: 25 },
  4: { marketShare: 0.30, totalKm: 110623, totalTowers: 442491, towersInspected: 132747, dailyCapacity: 25 },
  5: { marketShare: 0.50, totalKm: 116154, totalTowers: 464615, towersInspected: 232308, dailyCapacity: 25 }
};

const revenueProjection = {
  1: {
    dataCollectionRevenue: 2914580,
    saasAnalyticsRevenue: 1134850,
    totalPlatformRevenue: 4049430,
    apogeeRevenue: 664157,
    technologySolutionsRevenue: 907880,
    fieldOperationsRevenue: 2477393
  },
  2: {
    dataCollectionRevenue: 24482960,
    saasAnalyticsRevenue: 10435450,
    totalPlatformRevenue: 34918410,
    apogeeRevenue: 5759534,
    technologySolutionsRevenue: 8348360,
    fieldOperationsRevenue: 20810516
  },
  3: {
    dataCollectionRevenue: 51413240,
    saasAnalyticsRevenue: 23810350,
    totalPlatformRevenue: 75223590,
    apogeeRevenue: 12474056,
    technologySolutionsRevenue: 19048280,
    fieldOperationsRevenue: 43701254
  },
  4: {
    dataCollectionRevenue: 80975670,
    saasAnalyticsRevenue: 40487700,
    totalPlatformRevenue: 121463370,
    apogeeRevenue: 20243891,
    technologySolutionsRevenue: 32390160,
    fieldOperationsRevenue: 68829319
  },
  5: {
    dataCollectionRevenue: 141708880,
    saasAnalyticsRevenue: 76080900,
    totalPlatformRevenue: 217789780,
    apogeeRevenue: 36472512,
    technologySolutionsRevenue: 60864720,
    fieldOperationsRevenue: 120452548
  }
};

const scenarioAnalysis = {
  base: revenueProjection,
  bull: {
    1: { revenue: 4860000, notes: "Stronger initial pilot scale + faster Tier 2/3 mix" },
    2: { revenue: 41900000, notes: "10% higher conversion + slight price lift" },
    3: { revenue: 90270000, notes: "Tier 3 adoption expands faster" },
    4: { revenue: 145760000, notes: "Stronger MEA partner penetration" },
    5: { revenue: 261350000, notes: "Premium analytics embedded across regions" }
  },
  bear: {
    1: { revenue: 3240000, notes: "Conservative pilot uptake only" },
    2: { revenue: 27930000, notes: "Slower partner onboarding, limited Tier 2 shift" },
    3: { revenue: 60180000, notes: "Reduced substation adoption" },
    4: { revenue: 97170000, notes: "Only partial regional deployment" },
    5: { revenue: 174230000, notes: "Mostly Tier 1 accounts retained" }
  }
};

/**
 * Create an MCP server with capabilities for resources and tools
 */
const server = new Server(
  {
    name: "financial-modeling-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Handler for listing available financial model resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "financial-models://revenue-structure",
        mimeType: "application/json",
        name: "Revenue Structure",
        description: "Pricing tiers and service offerings"
      },
      {
        uri: "financial-models://growth-projections",
        mimeType: "application/json",
        name: "Growth Projections",
        description: "Market share and revenue projections"
      },
      {
        uri: "financial-models://bull-bear-analysis",
        mimeType: "application/json",
        name: "Bull-Bear Analysis",
        description: "Optimistic and pessimistic scenarios"
      }
    ]
  };
});

/**
 * Handler for reading financial model resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  switch (uri) {
    case "financial-models://revenue-structure": {
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            pricingTiers,
            tierDistribution
          }, null, 2)
        }]
      };
    }
    
    case "financial-models://growth-projections": {
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            marketData,
            revenueProjection
          }, null, 2)
        }]
      };
    }
    
    case "financial-models://bull-bear-analysis": {
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify(scenarioAnalysis, null, 2)
        }]
      };
    }
    
    default:
      throw new Error(`Resource not found: ${uri}`);
  }
});

/**
 * Handler for listing available financial modeling tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "revenue_projection",
        description: "Generate revenue projections based on market share, pricing tiers, and growth rates",
        inputSchema: {
          type: "object",
          properties: {
            market_share: {
              type: "number",
              description: "Market share percentage (0.0-1.0)"
            },
            pricing_tier_distribution: {
              type: "object",
              properties: {
                essential: { type: "number" },
                advanced: { type: "number" },
                enterprise: { type: "number" }
              },
              description: "Distribution of customers across pricing tiers"
            },
            years: {
              type: "number",
              description: "Number of years to project"
            }
          },
          required: ["market_share", "pricing_tier_distribution", "years"]
        }
      },
      {
        name: "scenario_analysis",
        description: "Analyze bull, base, and bear case scenarios for financial projections",
        inputSchema: {
          type: "object",
          properties: {
            base_case_adjustment: {
              type: "number",
              description: "Adjustment factor for base case (1.0 = no adjustment)"
            },
            bull_case_adjustment: {
              type: "number",
              description: "Adjustment factor for bull case (e.g., 1.2 = 20% increase)"
            },
            bear_case_adjustment: {
              type: "number",
              description: "Adjustment factor for bear case (e.g., 0.8 = 20% decrease)"
            },
            years: {
              type: "number",
              description: "Number of years to analyze"
            }
          },
          required: ["base_case_adjustment", "bull_case_adjustment", "bear_case_adjustment", "years"]
        }
      },
      {
        name: "sensitivity_analysis",
        description: "Analyze the sensitivity of financial projections to changes in key parameters",
        inputSchema: {
          type: "object",
          properties: {
            parameter: {
              type: "string",
              description: "Parameter to analyze (market_share, tier_distribution, pricing)"
            },
            variation_range: {
              type: "number",
              description: "Range of variation to analyze (e.g., 0.2 = ±20%)"
            },
            steps: {
              type: "number",
              description: "Number of steps in the analysis"
            }
          },
          required: ["parameter", "variation_range", "steps"]
        }
      }
    ]
  };
});

/**
 * Handler for calling financial modeling tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "revenue_projection": {
      const marketShare = request.params.arguments?.market_share;
      const tierDistribution = request.params.arguments?.pricing_tier_distribution;
      const years = request.params.arguments?.years;
      
      if (!marketShare || !tierDistribution || !years) {
        throw new Error("Missing required parameters");
      }
      
      // Calculate revenue projections
      const projections = {};
      
      for (let year = 1; year <= years; year++) {
        const totalTowers = 400000 * (1 + 0.05 * (year - 1)); // Approximate growth
        const towersInspected = totalTowers * marketShare;
        
        const essentialTowers = towersInspected * tierDistribution.essential;
        const advancedTowers = towersInspected * tierDistribution.advanced;
        const enterpriseTowers = towersInspected * tierDistribution.enterprise;
        
        const dataCollectionRevenue = 
          essentialTowers * pricingTiers.essential.dataCollectionFee +
          advancedTowers * pricingTiers.advanced.dataCollectionFee +
          enterpriseTowers * pricingTiers.enterprise.dataCollectionFee;
          
        const saasRevenue = 
          essentialTowers * pricingTiers.essential.saasFee +
          advancedTowers * pricingTiers.advanced.saasFee +
          enterpriseTowers * pricingTiers.enterprise.saasFee;
          
        const totalRevenue = dataCollectionRevenue + saasRevenue;
        
        projections[year] = {
          towersInspected: Math.round(towersInspected),
          essentialTowers: Math.round(essentialTowers),
          advancedTowers: Math.round(advancedTowers),
          enterpriseTowers: Math.round(enterpriseTowers),
          dataCollectionRevenue: Math.round(dataCollectionRevenue),
          saasRevenue: Math.round(saasRevenue),
          totalRevenue: Math.round(totalRevenue),
          apogeeRevenue: Math.round(totalRevenue * 0.164),
          technologySolutionsRevenue: Math.round(totalRevenue * 0.224),
          fieldOperationsRevenue: Math.round(totalRevenue * 0.612)
        };
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(projections, null, 2)
        }]
      };
    }
    
    case "scenario_analysis": {
      const baseCaseAdjustment = request.params.arguments?.base_case_adjustment;
      const bullCaseAdjustment = request.params.arguments?.bull_case_adjustment;
      const bearCaseAdjustment = request.params.arguments?.bear_case_adjustment;
      const years = request.params.arguments?.years;
      
      if (!baseCaseAdjustment || !bullCaseAdjustment || !bearCaseAdjustment || !years) {
        throw new Error("Missing required parameters");
      }
      
      // Calculate scenario analysis
      const scenarios = {
        base: {},
        bull: {},
        bear: {}
      };
      
      for (let year = 1; year <= Math.min(years, 5); year++) {
        const baseRevenue = revenueProjection[year].totalPlatformRevenue * baseCaseAdjustment;
        
        scenarios.base[year] = {
          revenue: Math.round(baseRevenue),
          apogeeRevenue: Math.round(baseRevenue * 0.164),
          notes: "Base case projection"
        };
        
        scenarios.bull[year] = {
          revenue: Math.round(baseRevenue * bullCaseAdjustment),
          apogeeRevenue: Math.round(baseRevenue * bullCaseAdjustment * 0.164),
          notes: scenarioAnalysis.bull[year].notes
        };
        
        scenarios.bear[year] = {
          revenue: Math.round(baseRevenue * bearCaseAdjustment),
          apogeeRevenue: Math.round(baseRevenue * bearCaseAdjustment * 0.164),
          notes: scenarioAnalysis.bear[year].notes
        };
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(scenarios, null, 2)
        }]
      };
    }
    
    case "sensitivity_analysis": {
      const parameter = request.params.arguments?.parameter;
      const variationRange = request.params.arguments?.variation_range;
      const steps = request.params.arguments?.steps;
      
      if (!parameter || !variationRange || !steps) {
        throw new Error("Missing required parameters");
      }
      
      // Calculate sensitivity analysis
      const sensitivity = {
        parameter,
        variationRange,
        steps,
        results: {}
      };
      
      const stepSize = (2 * variationRange) / (steps - 1);
      
      for (let i = 0; i < steps; i++) {
        const variation = -variationRange + i * stepSize;
        const adjustmentFactor = 1 + variation;
        
        sensitivity.results[`${(variation * 100).toFixed(0)}%`] = {};
        
        for (let year = 1; year <= 5; year++) {
          let revenue = revenueProjection[year].totalPlatformRevenue;
          
          switch (parameter) {
            case "market_share":
              revenue = revenue * adjustmentFactor;
              break;
            case "tier_distribution":
              // Simplified model - adjust based on blended SaaS price
              const baseBlendedPrice = tierDistribution[year].blendedSaasPrice;
              const adjustedBlendedPrice = baseBlendedPrice * adjustmentFactor;
              revenue = revenue * (adjustedBlendedPrice / baseBlendedPrice);
              break;
            case "pricing":
              revenue = revenue * adjustmentFactor;
              break;
          }
          
          sensitivity.results[`${(variation * 100).toFixed(0)}%`][year] = {
            revenue: Math.round(revenue),
            apogeeRevenue: Math.round(revenue * 0.164)
          };
        }
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(sensitivity, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Financial Modeling MCP server running on stdio');
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});