import express from "express";
import { techNewsAgent } from "../mastra.js";

const router = express.Router();

/**
 * ⚡ POST: Main route for Telex A2A calls - Direct agent implementation
 */
router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    // Extract parameters from JSON-RPC request
    const requestId = req.body.id || "unknown";
    const method = req.body.method;
    const params = req.body.params || {};
    const text = params.text || "";

    console.log(`🔍 Processing: method=${method}, text="${text}"`);

    // Handle different methods
    if (method === "getTechNews" || text.toLowerCase().includes("news")) {
      // Get the news tool from the agent
      const tools = await techNewsAgent.getTools();
      
      if (!tools?.getTechNews) {
        throw new Error("Tech News tool not available - agent not properly initialized");
      }

      // Execute the news tool with limit from params or default to 5
      const limit = params.limit || 5;
      console.log(`📰 Fetching ${limit} tech news headlines...`);

      const newsResult = await tools.getTechNews.execute({ limit });
      
      if (!newsResult.success) {
        throw new Error(newsResult.error || "Failed to fetch news from API");
      }

      // Format the response for Telex
      if (newsResult.headlines && newsResult.headlines.length > 0) {
        const headlines = newsResult.headlines.map((article, index) => 
          `${index + 1}. **${article.title}**\n   📰 Source: ${article.source}\n   🔗 ${article.url}`
        ).join('\n\n');

        const responseText = `📰 **Latest Tech News** (${newsResult.count} headlines)\n\n${headlines}\n\n_Powered by Tech News Agent_`;

        console.log(`✅ Successfully fetched ${newsResult.count} headlines`);

        // Return JSON-RPC success response
        return res.json({
          jsonrpc: "2.0",
          result: {
            event: { 
              text: responseText,
              metadata: {
                headlineCount: newsResult.count,
                timestamp: new Date().toISOString()
              }
            }
          },
          id: requestId
        });
      } else {
        throw new Error("No headlines received from news API");
      }
    } else {
      // Help message for other requests
      const helpText = `🤖 **Tech News Agent**\n\nI can help you get the latest technology news! Try asking:\n• "Get tech news"\n• "Latest headlines"\n• "What's new in tech?"\n\nI'll fetch the top technology stories from reliable sources.`;

      return res.json({
        jsonrpc: "2.0",
        result: {
          event: { text: helpText }
        },
        id: requestId
      });
    }

  } catch (error) {
    console.error("❌ Telex command error:", error.message);
    
    // User-friendly error message
    const errorMessage = `❌ Sorry, I couldn't fetch the tech news right now. Please try again in a few moments.\n\n_Error: ${error.message}_`;

    // JSON-RPC error response
    res.status(200).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: errorMessage
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
    timestamp: new Date().toISOString(),
    endpoints: {
      post_command: "POST /telex/command - Main webhook endpoint",
      get_health: "GET /telex/command - Health check"
    },
    usage: {
      example_request: {
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

/**
 * 🟢 Debug endpoint to test the agent directly
 */
router.post("/test", async (req, res) => {
  try {
    const limit = req.body.limit || 3;
    const tools = await techNewsAgent.getTools();
    
    if (!tools?.getTechNews) {
      return res.status(500).json({ error: "Agent tools not available" });
    }

    const result = await tools.getTechNews.execute({ limit });
    
    res.json({
      status: result.success ? "success" : "error",
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;