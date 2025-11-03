import express from "express";
import { techNewsAgent } from "../mastra.js";

const router = express.Router();

// Main endpoint for Tech News Agent
router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    const { method, params = {}, id } = req.body;
    
    if (method === "getTechNews" || params.text?.toLowerCase().includes('news')) {
      console.log("📰 Processing news request...");
      
      const tools = await techNewsAgent.getTools();
      
      if (!tools?.getTechNews) {
        console.error("❌ News tool not available");
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not available" },
          id
        });
      }

      const limit = params.limit || 5;
      console.log(`🔍 Fetching ${limit} news headlines...`);
      
      const newsResult = await tools.getTechNews.execute({ limit });
      console.log("📊 News result:", newsResult);
      
      if (!newsResult.success) {
        console.error("❌ News API failed:", newsResult.error);
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32000, message: newsResult.error },
          id
        });
      }

      // Format response
      const headlines = newsResult.headlines.map((article, index) => 
        `${index + 1}. **${article.title}**\n   📰 ${article.source} | 🔗 ${article.url}`
      ).join('\n\n');

      const responseText = `📰 **Latest Tech News**\n\n${headlines}`;
      
      console.log("✅ Sending successful response");
      
      return res.json({
        jsonrpc: "2.0",
        result: {
          event: { text: responseText }
        },
        id
      });
    }

    // Default response for other methods
    console.log("ℹ️ Sending help response");
    res.json({
      jsonrpc: "2.0",
      result: {
        event: { 
          text: "🤖 I'm Tech News Agent! Ask me for 'tech news' to get the latest headlines." 
        }
      },
      id
    });

  } catch (error) {
    console.error("❌ Telex command error:", error);
    res.json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal error" },
      id: req.body?.id || null
    });
  }
});

// 🔧 ADDITIONAL ENDPOINTS FOR DIFFERENT AGENT CONFIGURATIONS

// Endpoint for Tech News Space agent
router.post("/tech-news-space", async (req, res) => {
  console.log("🔗 Tech News Space endpoint called");
  return await router.handle({...req, path: '/command'}, res);
});

// Endpoint for space variations
router.post("/space", async (req, res) => {
  console.log("🔗 Space endpoint called");
  return await router.handle({...req, path: '/command'}, res);
});

// Generic A2A endpoint
router.post("/a2a", async (req, res) => {
  console.log("🔗 A2A endpoint called");
  return await router.handle({...req, path: '/command'}, res);
});

// Root endpoint (some platforms use this)
router.post("/", async (req, res) => {
  console.log("🔗 Root endpoint called");
  return await router.handle({...req, path: '/command'}, res);
});

// Webhook endpoint (alternative naming)
router.post("/webhook", async (req, res) => {
  console.log("🔗 Webhook endpoint called");
  return await router.handle({...req, path: '/command'}, res);
});

// Message endpoint (common pattern)
router.post("/message", async (req, res) => {
  console.log("🔗 Message endpoint called");
  return await router.handle({...req, path: '/command'}, res);
});

/**
 * 🧠 Health check for Telex integration
 */
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Telex Tech News Agent is active and ready",
    agent: "tech_news_agent",
    endpoints: [
      "POST /telex/command",
      "POST /telex/tech-news-space", 
      "POST /telex/space",
      "POST /telex/a2a",
      "POST /telex/webhook",
      "POST /telex/message",
      "POST /telex/"
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * 🔍 Debug endpoint to see recent activity
 */
router.get("/debug", (req, res) => {
  res.json({
    status: "debug",
    message: "Tech News Agent API is running",
    timestamp: new Date().toISOString(),
    usage: "Use POST endpoints for Telex integration"
  });
});

export default router;