// mastra.js - COMPLETELY FIXED VERSION
import dotenv from 'dotenv';
dotenv.config();

// Disable telemetry
process.env._MASTRA_TELEMETRY___ = 'false';
globalThis.___MASTRA_TELEMETRY___ = true;

import { Mastra, Agent } from '@mastra/core';
import axios from 'axios';

// Get A2A URL - FIXED: Use agent endpoint, not webhook
const A2A_URL = process.env.A2A_URL || 'http://localhost:3000/telex/a2a/agent/techpulse';

console.log('🔧 A2A Configuration:', {
  url: A2A_URL,
  exists: !!A2A_URL,
  length: A2A_URL?.length
});

// Create TechPulse Agent with explicit configuration
const agentConfig = {
  id: 'techpulse', // Explicit ID
  name: 'TechPulse Agent',
  instructions: `You are a helpful tech news assistant that fetches the latest technology headlines.
When users ask for news, tech news, or latest news, use your getTechNews tool to fetch current headlines from NewsAPI.
Format the response in a clear, engaging way with emojis and proper formatting.`,
  model: {
    provider: 'openai',
    name: 'gpt-4',
  },
  tools: {
    getTechNews: {
      description: 'Fetch latest technology news from NewsAPI',
      parameters: {
        type: 'object',
        properties: { 
          limit: { 
            type: 'number', 
            default: 5,
            description: 'Number of news articles to fetch'
          } 
        },
        required: []
      },
      execute: async ({ limit = 5 }) => {
        try {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) throw new Error('NewsAPI key missing');

          console.log(`📡 Fetching ${limit} tech news articles...`);
          
          const url = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`;
          const response = await axios.get(url, { timeout: 10000 });

          if (response.data.status !== 'ok') throw new Error('NewsAPI error');

          const articles = response.data.articles
            .filter(article => article.title && article.title !== '[Removed]')
            .slice(0, limit);

          if (articles.length === 0) {
            return { 
              success: true, 
              message: '📰 No tech news available at the moment. Please try again later!' 
            };
          }

          const headlines = articles
            .map((article, index) => 
              `${index + 1}. 📰 ${article.title}\n   🔗 ${article.url}`
            )
            .join('\n\n');

          return { 
            success: true, 
            message: `Here are the latest tech headlines:\n\n${headlines}` 
          };

        } catch (error) {
          console.error('❌ NewsAPI Error:', error.message);
          return { 
            success: false, 
            message: '📰 Sorry, I couldn\'t fetch tech news at the moment. Please try again later!' 
          };
        }
      },
    },
  },
};

console.log('🔄 Creating agent with ID:', agentConfig.id);

// Create the agent
const techPulseAgent = new Agent(agentConfig);

// Manually set A2A configuration
techPulseAgent.a2a = {
  enabled: true,
  url: A2A_URL,
};

console.log('✅ Agent created:', {
  id: techPulseAgent.id,
  hasA2A: !!techPulseAgent.a2a,
  a2aUrl: techPulseAgent.a2a?.url
});

// FIXED: Initialize Mastra with agents object format
export const mastra = new Mastra({
  agents: {
    techpulse: techPulseAgent  // Explicit key-value mapping
  }
});

// DEBUG: Check agent registration
console.log('🔍 Mastra initialization complete');
const agents = mastra.getAgents();
console.log('📋 Raw agents object:', agents);
console.log('📋 Agent keys:', Object.keys(agents));
console.log('📋 Agent values:', Object.values(agents).map(a => a?.id));

// Test agent retrieval
const testAgent = mastra.getAgent('techpulse');
console.log('✅ Test retrieval - Agent found:', !!testAgent);
console.log('✅ Test retrieval - Agent ID:', testAgent?.id);

// Export the agent for use in routes
export { techPulseAgent };

console.log('🎉 Mastra setup completed successfully!');