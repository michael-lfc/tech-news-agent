// mastra.js - HEROKU PRODUCTION VERSION
import dotenv from 'dotenv';
dotenv.config();

process.env._MASTRA_TELEMETRY___ = 'false';
globalThis.___MASTRA_TELEMETRY___ = true;

import { Mastra, Agent } from '@mastra/core';
import axios from 'axios';

// Heroku A2A URL from environment
const A2A_URL = process.env.A2A_URL;

console.log('🚀 Heroku Deployment Detected');
console.log('🔧 A2A_URL:', A2A_URL);

// Create TechPulse Agent
const techPulseAgent = new Agent({
  id: 'techpulse',
  name: 'TechPulse Agent',
  instructions: `You are a helpful tech news assistant that fetches the latest technology headlines.`,
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
          limit: { type: 'number', default: 5 }
        }
      },
      execute: async ({ limit = 5 }) => {
        try {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) throw new Error('NewsAPI key missing');
          
          const url = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`;
          const response = await axios.get(url, { timeout: 10000 });
          
          if (response.data.status !== 'ok') throw new Error('NewsAPI error');
          
          const articles = response.data.articles
            .filter(a => a.title && a.title !== '[Removed]')
            .slice(0, limit);
            
          const headlines = articles
            .map((a, i) => `${i + 1}. 📰 ${a.title}\n   🔗 ${a.url}`)
            .join('\n\n');
            
          return { 
            success: true, 
            message: `Latest tech news:\n\n${headlines}` 
          };
        } catch (error) {
          return { 
            success: false, 
            message: '📰 News unavailable, try again later!' 
          };
        }
      }
    }
  }
});

// MANUAL A2A CONFIGURATION FOR HEROKU
techPulseAgent.a2a = {
  enabled: true,
  url: A2A_URL
};

console.log('✅ Heroku A2A Configured:', techPulseAgent.a2a?.url);

export const mastra = new Mastra({
  agents: { techpulse: techPulseAgent }
});

console.log('🎉 Heroku Deployment Ready!');
export { techPulseAgent };