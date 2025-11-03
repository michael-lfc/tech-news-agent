import express from "express";
import { mastra, techNewsAgent } from "../mastra.js";

const router = express.Router();

/**
 * ⚡ POST: Main route for Telex A2A calls - Fixed Mastra implementation
 */
router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    const { text, id } = req.body.params || req.body;
    
    // Check if message is asking for news
    const messageText = text?.toLowerCase() || '';
    const wantsNews = messageText.includes('news') || messageText.includes('headlines');

    if (!wantsNews) {
      // If not asking for news, return helpful message
      return res.json({
        jsonrpc: "2.0",
        result: {
          event: { 
            text: "🤖 I'm a Tech News Agent! Ask me for 'tech news' or 'latest headlines' to get started." 
          }
        },
        id: id || req.body.id
      });
    }

    // Use the agent directly to process the message
    const tools = await techNewsAgent.getTools();
    
    if (!tools?.getTechNews) {
      throw new Error("Tech News tool not available");
    }

    // Execute the news tool
    const newsResult = await tools.getTechNews.execute({ limit: 5 });
    
    if (!newsResult.success) {
      throw new Error(newsResult.error || "Failed to fetch news");
    }

    // Format the response
    const headlines = newsResult.headlines.map((article, index) => 
      `${index + 1}. **${article.title}**\n   📰 ${article.source} | 🔗 ${article.url}`
    ).join('\n\n');

    const responseText = `📰 **Latest Tech News**\n\n${headlines}\n\n_Powered by Tech News Agent_`;

    // Return proper JSON-RPC response
    res.json({
      jsonrpc: "2.0",
      result: {
        event: { text: responseText }
      },
      id: id || req.body.id
    });

  } catch (error) {
    console.error("❌ Telex command error:", error);
    
    // Provide proper JSON-RPC error response
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: `Tech News Agent Error: ${error.message}`
      },
      id: req.body?.id || null
    });
  }
});

/**
 * 🧠 Health check for Telex integration
 */
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Telex Tech News Agent is active and ready",
    agent: "tech_news_agent",
    usage: {
      method: "POST",
      path: "/telex/command",
      example_body: {
        jsonrpc: "2.0",
        method: "message", 
        params: {
          text: "get tech news",
          channel: "general"
        },
        id: "msg_001"
      }
    }
  });
});

export default router;