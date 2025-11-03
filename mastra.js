import { Mastra, Agent } from "@mastra/core";
import axios from "axios";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load workflow.json dynamically (Mastra best practice)
const workflowPath = join(__dirname, "workflow.json");
const workflow = JSON.parse(await readFile(workflowPath, "utf-8"));

export const techNewsAgent = new Agent({
  name: "tech_news_agent",
  instructions: `
    You are a helpful tech news assistant.
    When a user asks for tech news, fetch the latest technology headlines
    from NewsAPI and return them in a concise, readable format.
    Always respond in Markdown-style blocks with title, source, and link.
  `,
  model: {
    provider: "openai",
    name: "gpt-4",
  },
  tools: {
    getTechNews: {
      description: "Fetch the latest technology news headlines",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of headlines to return",
            default: 5
          }
        },
        required: []
      },
      execute: async ({ limit = 5 }) => {
        try {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) {
            return { success: false, error: "NEWS_API_KEY not configured" };
          }

          const response = await axios.get(
            `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${apiKey}`
          );

          const articles = response.data.articles.slice(0, limit);
          const headlines = articles.map((article, index) => ({
            number: index + 1,
            title: article.title,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt
          }));

          return {
            success: true,
            count: headlines.length,
            headlines
          };
        } catch (error) {
          console.error("NewsAPI Error:", error.response?.data || error.message);
          return {
            success: false,
            error: "Failed to fetch tech news. Please try again later."
          };
        }
      },
    },
  },
});

// Initialize Mastra
export const mastra = new Mastra({
  agents: [techNewsAgent],
  workflow,
});

console.log("Mastra initialized with Tech News Agent & A2A Workflow");

