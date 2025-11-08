// mastra.js
import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ TechPulse Agent with A2A
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

  // Tools
  tools: {
    getTechNews: {
      description: "Fetch latest technology news from NewsAPI",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 5 },
        },
      },
      execute: async ({ limit = 5 }) => {
        try {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) throw new Error("NewsAPI key missing");

          const url = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`;
          const response = await axios.get(url, { timeout: 10000 });

          if (response.data.status !== "ok") throw new Error("NewsAPI error");

          const headlines = response.data.articles
            .filter(a => a.title)
            .slice(0, limit)
            .map((a, i) => ({ number: i + 1, title: a.title, url: a.url }));

          return { success: true, headlines };
        } catch (err) {
          console.error("❌ NewsAPI Error:", err.message);
          return { success: false, headlines: [] };
        }
      },
    },
  },

  // ✅ Enable A2A with dynamic channelId
  a2a: {
    enabled: true,
    url: `${process.env.BASE_URL || "http://localhost:3000"}/telex/a2a/{channelId}/message`,
  },
});

// Initialize Mastra with agent
export const mastra = new Mastra({
  agents: [techPulseAgent],
});

console.log("✅ Mastra initialized with TechPulse Agent and A2A enabled");
