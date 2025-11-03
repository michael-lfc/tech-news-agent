// mastra.js
import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load workflow.json
const workflowPath = join(__dirname, "workflow.json");
const workflow = JSON.parse(await readFile(workflowPath, "utf-8"));

// Warn if NEWS_API_KEY is missing
if (!process.env.NEWS_API_KEY) {
  console.warn("⚠️  NEWS_API_KEY not configured — Tech News Agent may fail.");
}

// ✅ Enhanced Tech News Agent with better message handling
export const techNewsAgent = new Agent({
  name: "tech_news_agent",
  instructions: `
    You are a helpful tech news assistant on Telex.im.
    When a user asks for tech news or sends any message containing "news", 
    fetch the latest technology headlines from NewsAPI.
    
    Format your response in a clean, readable way with:
    - Each headline as a numbered item
    - Title, source, and URL for each article
    - Use Markdown-style formatting for better readability
    
    If the user doesn't ask for news, politely explain that you're a tech news assistant.
  `,
  model: {
    provider: "openai",
    name: "gpt-4",
  },
  tools: {
    getTechNews: {
      description: "Fetch the latest technology news headlines from NewsAPI",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of headlines to return (default: 5)",
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
            throw new Error(response.data.message || "NewsAPI returned error");
          }

          const articles = response.data.articles.slice(0, limit);
          const headlines = articles.map((article, index) => ({
            number: index + 1,
            title: article.title || "No title",
            source: article.source?.name || "Unknown source",
            url: article.url || "#",
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

// ✅ Initialize Mastra with the workflow
export const mastra = new Mastra({
  agents: [techNewsAgent],
  workflow,
  aiTracing: process.env.AI_TRACING === "true",
});

console.log("✅ Mastra initialized with Tech News Agent & A2A Workflow");