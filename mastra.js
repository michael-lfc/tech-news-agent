import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ TechPulse Agent
export const techPulseAgent = new Agent({
  id: "techPulse",
  name: "Tech Pulse Agent", 
  instructions: `You are a helpful tech news assistant that fetches the latest technology headlines.
  
When users ask for news, tech news, or latest news, use your getTechNews tool to fetch current headlines from NewsAPI.
Format the response in a clear, engaging way with emojis and proper formatting.`,

  model: {
    provider: "openai",
    name: "gpt-4",
  },

  // Remove A2A config - we'll handle it in Express routes
  tools: {
    getTechNews: {
      description: "Fetch latest technology news from NewsAPI",
      parameters: {
        type: "object",
        properties: {
          limit: { 
            type: "number", 
            default: 5,
            description: "Number of news articles to fetch (1-10)"
          },
        },
      },
      execute: async ({ limit = 5 }) => {
        try {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) {
            console.error("❌ NewsAPI key missing");
            return {
              success: false,
              message: "📰 News service is currently unavailable. Please try again later."
            };
          }

          const url = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`;

          console.log(`📡 Fetching ${limit} tech news articles...`);
          const response = await axios.get(url, { timeout: 10000 });

          if (response.data.status !== "ok") {
            throw new Error(response.data.message || "NewsAPI error");
          }

          const headlines = response.data.articles
            .filter((article) => article.title && article.title !== "[Removed]")
            .slice(0, limit)
            .map((article, index) => ({
              number: index + 1,
              title: article.title,
              source: article.source?.name || "Unknown",
              url: article.url,
              description: article.description || "No description available"
            }));

          console.log(`✅ Fetched ${headlines.length} news articles`);
          
          return { 
            success: true, 
            count: headlines.length, 
            headlines,
            message: headlines.length > 0 
              ? `Here are the latest tech news headlines:\n\n${headlines.map(article => `📰 ${article.title}\n🔗 ${article.url}`).join('\n\n')}`
              : "No recent tech news articles found."
          };

        } catch (error) {
          console.error("❌ NewsAPI Error:", error.message);

          if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            return {
              success: false,
              message: "⏰ News service is taking longer than expected. Please try again in a moment!"
            };
          }

          if (error.response?.status === 401) {
            return {
              success: false,
              message: "🔑 News service configuration issue. Please contact support."
            };
          }

          return {
            success: false,
            message: "📰 Tech news is temporarily unavailable. Please try again later!"
          };
        }
      },
    },
  },
});

// ✅ Initialize Mastra
export const mastra = new Mastra({
  agents: [techPulseAgent],
});

// Helper function to get agent by ID
export const getAgent = (agentId) => {
  return mastra.getAgent(agentId);
};

console.log("✅ Mastra initialized with TechPulse Agent");