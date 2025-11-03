// mastra.js
import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Warn if NEWS_API_KEY is missing
if (!process.env.NEWS_API_KEY) {
  console.warn("⚠️  NEWS_API_KEY not configured — Tech News Agent may fail.");
}

// ✅ Tech News Agent
export const techNewsAgent = new Agent({
  name: "tech_news_agent",
  instructions: `
    You are a helpful tech news assistant on Telex.im.
    When users ask for tech news, fetch the latest headlines and return them in a clean format.
    Be concise and helpful.
  `,
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
          limit: {
            type: "number",
            description: "Number of headlines to return",
            default: 5,
          },
        },
        required: [],
      },
      execute: async ({ limit = 5 }) => {
        try {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) {
            throw new Error("NewsAPI key not configured");
          }

          const url = `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`;
          const response = await axios.get(url);

          if (response.data.status !== "ok") {
            throw new Error(response.data.message || "NewsAPI error");
          }

          const articles = response.data.articles.slice(0, limit);
          const headlines = articles
            .filter(article => article.title && article.title !== '[Removed]')
            .map((article, index) => ({
              number: index + 1,
              title: article.title,
              source: article.source?.name || "Unknown",
              url: article.url,
              publishedAt: article.publishedAt,
            }));

          return {
            success: true,
            count: headlines.length,
            headlines,
          };
        } catch (error) {
          console.error("❌ NewsAPI Error:", error.response?.data || error.message);
          return {
            success: false,
            error: error.response?.data?.message || error.message,
          };
        }
      },
    },
  },
});

// ✅ Initialize Mastra (simplified - no workflow for now)
export const mastra = new Mastra({
  agents: [techNewsAgent],
});

console.log("✅ Mastra initialized with Tech News Agent");