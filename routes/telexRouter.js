import express from "express";
import { mastra } from "../mastra.js";
import { fetchTechNews } from "../controllers/newsController.js";

const router = express.Router();

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// --- CORRECT A2A Endpoint (Telex Protocol) ---
router.post("/a2a/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const a2aRequest = req.body;

    console.log(`🤖 A2A Request for agent: ${agentId}`);
    console.log('🔍 Request method:', a2aRequest.method);

    // Get agent
    const agents = mastra.getAgents();
    const agent = agents[agentId];
    
    if (!agent) {
      return res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32601, message: `Agent ${agentId} not found` },
        id: a2aRequest.id
      });
    }

    // Extract data from Telex format
    const text = a2aRequest.params?.message?.parts?.find(p => p.kind === "text")?.text;
    const channelId = a2aRequest.params?.message?.metadata?.telex_channel_id;
    const userId = a2aRequest.params?.message?.metadata?.telex_user_id;

    console.log(`📝 Message: "${text}" from ${userId} in ${channelId}`);

    let responseText = "I can fetch the latest tech news! Try saying 'news' or 'tech news' 📰";

    if (text && /news|tech|headlines/i.test(text)) {
      console.log("🔄 Fetching tech news...");
      const newsResult = await agent.tools.getTechNews.execute({ limit: 5 });
      responseText = newsResult.message || "No tech news available at the moment.";
    }

    // CORRECT Telex A2A Response Format
    const response = {
      jsonrpc: "2.0",
      id: a2aRequest.id,
      result: {
        id: generateId(),
        kind: "task",
        contextId: channelId,
        status: {
          state: "input-required",
          message: {
            kind: "message",
            role: "agent",
            parts: [
              {
                kind: "text",
                text: responseText,
                metadata: null
              }
            ],
            metadata: null,
            messageId: generateId(),
            contextId: channelId,
            taskId: null
          },
          timestamp: new Date().toISOString()
        },
        artifacts: null,
        history: null,
        metadata: null
      },
      error: null
    };

    console.log('✅ Sending Telex-compliant response');
    res.json(response);

  } catch (err) {
    console.error("💥 A2A Error:", err);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal server error" },
      id: req.body?.id
    });
  }
});

// --- Webhook Endpoint ---
router.all("/a2a/:channelId/message", async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text, user_id, id } = req.method === "GET" ? req.query : req.body;

    console.log(`📩 Webhook message from channel ${channelId}:`, text);

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
    console.error("💥 Webhook error:", err);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: err.message },
      id: req.body?.id || null
    });
  }
});

// --- Registration endpoint ---
router.get("/register", (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.json({
    status: "ready",
    webhook_endpoint: `${baseUrl}/telex/a2a/{channelId}/message`,
    a2a_endpoint: `${baseUrl}/telex/a2a/agent/techpulse`,
    instructions: "Use the webhook endpoint for direct messages, or the A2A endpoint for JSON-RPC 2.0 messages"
  });
});

export default router;