import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ TechPulse Agent
export const techPulseAgent = new Agent({
  id: "techPulse", // Use 'id' instead of 'name' for agent identification
  name: "Tech Pulse Agent", 
  instructions: "You are a helpful tech news assistant that fetches the latest technology headlines.",
  model: {
    provider: "openai",
    name: "gpt-4",
  },

  // A2A Configuration
  a2a: {
    webhookUrl: "https://powerful-atoll-01260-84ad49c653d5.herokuapp.com/telex/a2a/techpulse/message"
  },

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

          const response = await axios.get(url, { timeout: 8000 });

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
            }));

          return { success: true, count: headlines.length, headlines };
        } catch (error) {
          console.error("NewsAPI Error:", error.message);

          if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            return {
              success: true,
              count: 0,
              headlines: [],
              message:
                "📰 Here are recent tech trends:\n\n• AI advancements continue to shape industries\n• Cybersecurity remains a top priority\n• Cloud computing adoption continues to grow\n• Electric vehicle market expansion accelerates\n• 5G rollout enables new IoT applications\n\nNewsAPI is currently slow. Try again soon!",
            };
          }

          return {
            success: true,
            count: 0,
            headlines: [],
            message: "📰 Tech news is temporarily unavailable. Please try again later!",
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

console.log("✅ Mastra initialized with TechPulse Agent");