// routes/telexRouter.js
import express from "express";
import axios from "axios";
import { mastra } from "../mastra.js";
import { fetchTechNews } from "../controllers/newsController.js";

const router = express.Router();

// ✅ KEEP THIS - Your working webhook endpoint
router.all("/a2a/:channelId/message", async (req, res) => {
  try {
    const { channelId } = req.params;
    const isGet = req.method === 'GET';
    
    // Get data from either body (POST) or query (GET)
    const { text, user_id, id } = isGet ? req.query : req.body;

    console.log(`📩 ${req.method} Telex message from channel ${channelId}:`, text);

    if (text && text.toLowerCase().includes('news')) {
      const limit = text.toLowerCase().includes('latest') ? 5 : 3;
      const articles = await fetchTechNews(limit);
      
      const newsText = articles.map(article => 
        `📰 ${article.title}\n🔗 ${article.url}`
      ).join('\n\n');

      return res.json({
        jsonrpc: "2.0",
        result: {
          event: {
            text: `Here's your tech news:\n\n${newsText}`,
            channel_id: channelId,
            user_id: user_id
          }
        },
        id: id || null
      });
    }

    // Default help response
    res.json({
      jsonrpc: "2.0",
      result: {
        event: {
          text: "I can fetch the latest tech news for you! Try saying 'news' or 'tech news'",
          channel_id: channelId,
          user_id: user_id
        }
      },
      id: id || null
    });

  } catch (error) {
    console.error(`💥 ${req.method} Telex message processing error:`, error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { 
        code: -32603, 
        message: "Internal server error while processing news request" 
      },
      id: req.method === 'GET' ? req.query?.id : req.body?.id || null
    });
  }
});

// ✅ OPTIONAL: Mastra A2A endpoint (for future use)
router.post("/a2a/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const a2aRequest = req.body;

    console.log(`🤖 A2A Request for agent: ${agentId}`);

    const agent = mastra.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32601, message: `Agent not found` },
        id: a2aRequest.id
      });
    }

    const text = a2aRequest.params?.message?.parts?.find(p => p.kind === "text")?.text;
    
    if (text && text.toLowerCase().includes('news')) {
      const newsResult = await agent.tools.getTechNews.execute({ limit: 5 });
      const response = newsResult.message || "No news available.";
      
      return res.json({
        jsonrpc: "2.0",
        result: { messages: [{ kind: "text", text: response }] },
        id: a2aRequest.id
      });
    }

    res.json({
      jsonrpc: "2.0", 
      result: { messages: [{ kind: "text", text: "Ask me for 'news'! 📰" }] },
      id: a2aRequest.id
    });

  } catch (error) {
    console.error("A2A error:", error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal error" },
      id: req.body?.id || null
    });
  }
});

// Registration endpoint
router.get("/register", async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    const registrationInfo = {
      status: "ready",
      webhook_endpoint: `${baseUrl}/telex/a2a/{channelId}/message`,
      a2a_endpoint: `${baseUrl}/telex/a2a/agent/techPulse`,
      instructions: "Use the webhook endpoint for current setup, or A2A endpoint for Mastra node format"
    };

    res.status(200).json(registrationInfo);
  } catch (error) {
    console.error("Registration info error:", error);
    res.status(500).json({ 
      error: "Failed to generate registration info",
      details: error.message 
    });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "telex-integration",
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: "/telex/a2a/{channelId}/message",
      a2a_agent: "/telex/a2a/agent/techPulse"
    }
  });
});

// Test endpoint
router.get("/test", (req, res) => {
  res.status(200).json({
    message: "✅ Telex endpoints are active",
    test_webhook: "POST to /telex/a2a/techpulse/message with { text: 'news' }",
    test_a2a: "POST to /telex/a2a/agent/techPulse with JSON-RPC format"
  });
});

export default router;