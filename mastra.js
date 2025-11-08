// mastra.js
import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

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

  tools: {
    getTechNews: {
      description: "Fetch latest technology news from NewsAPI",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 5 }
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
            .map((a) => `📰 ${a.title}\n🔗 ${a.url}`)
            .join("\n\n");

          return { success: true, message: headlines };
        } catch (err) {
          console.error("❌ NewsAPI Error:", err.message);
          return { success: false, message: "📰 Tech news unavailable, try again later!" };
        }
      },
    },
  },
});

// ✅ Initialize Mastra and manually attach A2A after agent creation
export const mastra = new Mastra({
  agents: [techPulseAgent],
});

// ✅ Safely attach A2A URL after Mastra is ready
techPulseAgent.a2a = {
  enabled: true,
  url: process.env.A2A_URL || "http://localhost:3000/telex/a2a/techpulse/message",
};

console.log("✅ Mastra initialized with TechPulse Agent and A2A enabled");
console.log("🌐 A2A URL:", techPulseAgent.a2a.url);
