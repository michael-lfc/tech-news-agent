// mastra.js - WORKING A2A VERSION
import dotenv from 'dotenv';
dotenv.config();

// Disable telemetry completely
process.env._MASTRA_TELEMETRY___ = 'false';
globalThis.___MASTRA_TELEMETRY___ = true;

import { Mastra, Agent } from '@mastra/core';
import axios from 'axios';

// Get A2A URL
const A2A_URL = process.env.A2A_URL || 'http://localhost:3000/telex/a2a/techpulse/message';

console.log('🔧 A2A Configuration:', {
  url: A2A_URL,
  exists: !!A2A_URL,
  length: A2A_URL?.length
});

// Create TechPulse Agent - FIXED A2A CONFIGURATION
export const techPulseAgent = new Agent({
  id: 'techpulse',
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
          if (!apiKey) {
            throw new Error('NewsAPI key missing');
          }

          console.log(`📡 Fetching ${limit} tech news articles...`);
          
          const url = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`;
          const response = await axios.get(url, { timeout: 10000 });

          if (response.data.status !== 'ok') {
            throw new Error(`NewsAPI error: ${response.data.message}`);
          }

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
});

// CRITICAL FIX: Manually set A2A configuration after agent creation
console.log('🔄 Manually configuring A2A...');
techPulseAgent.a2a = {
  enabled: true,
  url: A2A_URL,
};

// Initialize Mastra
export const mastra = new Mastra({
  agents: [techPulseAgent],
});

console.log('✅ Mastra initialized successfully');
console.log('🤖 Agent ID:', techPulseAgent.id);
console.log('🌐 A2A Status:', techPulseAgent.a2a ? 'Configured ✅' : 'Not configured ❌');
console.log('🌐 A2A URL:', techPulseAgent.a2a?.url || 'Not set');
console.log('🔧 Available tools:', techPulseAgent.getTools ? Object.keys(techPulseAgent.getTools()) : 'getTools not available');

// Test if agent is properly registered
console.log('📋 Mastra agents check:', mastra.getAgents() ? 'Agents loaded' : 'No agents');