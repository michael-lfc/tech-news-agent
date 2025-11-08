// routes/telexRouter.js
import express from "express";
import { mastra } from "../mastra.js";
import { fetchTechNews } from "../controllers/newsController.js";

const router = express.Router();

// --- Main webhook endpoint (for direct messages) ---
router.all("/a2a/:channelId/message", async (req, res) => {
  try {
    const { channelId } = req.params;

    // Support GET query params or POST body
    const { text, user_id, id } = req.method === "GET" ? req.query : req.body;

    console.log(`📩 Telex message from channel ${channelId}:`, text);

    if (text && text.toLowerCase().includes("news")) {
      const articles = await fetchTechNews(5);
      const newsText = articles.map(a => `📰 ${a.title}\n🔗 ${a.url}`).join("\n\n");

      return res.json({
        jsonrpc: "2.0",
        result: {
          messages: [
            { kind: "text", text: `Here's your tech news:\n\n${newsText}`, channel_id: channelId, user_id }
          ]
        },
        id: id || null
      });
    }

    // Default response
    res.json({
      jsonrpc: "2.0",
      result: {
        messages: [
          { kind: "text", text: "I can fetch the latest tech news! Try saying 'news'.", channel_id: channelId }
        ]
      },
      id: id || null
    });
  } catch (err) {
    console.error("💥 Telex webhook error:", err);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: err.message },
      id: req.body?.id || null
    });
  }
});

// --- Mastra A2A endpoint (JSON-RPC 2.0) ---
router.post("/a2a/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const a2aRequest = req.body;

    console.log(`🤖 A2A Request for agent: ${agentId}`, a2aRequest);

    const agent = mastra.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32601, message: "Agent not found" },
        id: a2aRequest.id || null
      });
    }

    // Safely extract text from JSON-RPC 2.0 format
    const text = a2aRequest?.params?.message?.parts?.find(p => p.kind === "text")?.text;

    if (text && text.toLowerCase().includes("news")) {
      const newsResult = await agent.tools.getTechNews.execute({ limit: 5 });
      const responseText = newsResult.message || "No news available.";

      return res.json({
        jsonrpc: "2.0",
        result: { messages: [{ kind: "text", text: responseText }] },
        id: a2aRequest.id || null
      });
    }

    // Default A2A response
    res.json({
      jsonrpc: "2.0",
      result: { messages: [{ kind: "text", text: "Ask me for 'news' to get the latest tech headlines! 📰" }] },
      id: a2aRequest.id || null
    });
  } catch (err) {
    console.error("💥 A2A error:", err);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: err.message },
      id: req.body?.id || null
    });
  }
});

// --- Registration info endpoint ---
router.get("/register", (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.json({
    status: "ready",
    webhook_endpoint: `${baseUrl}/telex/a2a/{channelId}/message`,
    a2a_endpoint: `${baseUrl}/telex/a2a/agent/techPulse`,
    instructions: "Use the webhook endpoint for direct messages, or the A2A endpoint for JSON-RPC 2.0 messages"
  });
});

export default router;
