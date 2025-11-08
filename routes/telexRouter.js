import express from "express";
import { mastra } from "../mastra.js";
import { fetchTechNews } from "../controllers/newsController.js";

const router = express.Router();

// --- Main webhook endpoint ---
router.all("/a2a/:channelId/message", async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text, user_id, id } = req.method === 'GET' ? req.query : req.body;

    console.log(`📩 Telex message from channel ${channelId}:`, text);

    if (text && text.toLowerCase().includes("news")) {
      const articles = await fetchTechNews(5);
      const newsText = articles.map(a => `📰 ${a.title}\n🔗 ${a.url}`).join("\n\n");

      return res.json({
        jsonrpc: "2.0",
        result: { messages: [{ kind: "text", text: `Here's your tech news:\n\n${newsText}`, channel_id: channelId, user_id }] },
        id: id || null
      });
    }

    // Default response
    res.json({
      jsonrpc: "2.0",
      result: { messages: [{ kind: "text", text: "I can fetch the latest tech news! Try saying 'news'.", channel_id: channelId }] },
      id: id || null
    });
  } catch (err) {
    console.error("💥 Telex webhook error:", err);
    res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: err.message }, id: req.body?.id || null });
  }
});

// --- Mastra A2A endpoint ---
router.post("/a2a/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    console.log(`🤖 A2A Request for agent: ${agentId}`);

    const agent = mastra.getAgent(agentId);
    if (!agent) {
      console.warn(`❌ Agent ${agentId} not found`);
      return res.status(404).json({ jsonrpc: "2.0", error: { code: -32601, message: "Agent not found" }, id: req.body?.id });
    }

    const text = req.body?.params?.message?.parts?.find(p => p.kind === "text")?.text;

    if (text && text.toLowerCase().includes("news")) {
      const newsResult = await agent.tools.getTechNews.execute({ limit: 5 });
      return res.json({ jsonrpc: "2.0", result: { messages: [{ kind: "text", text: newsResult.message }] }, id: req.body?.id });
    }

    res.json({ jsonrpc: "2.0", result: { messages: [{ kind: "text", text: "Ask me for 'news' to get the latest tech headlines! 📰" }] }, id: req.body?.id });
  } catch (err) {
    console.error("💥 A2A error:", err);
    res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: err.message }, id: req.body?.id || null });
  }
});

// --- Registration info endpoint ---
router.get("/register", (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.json({
    status: "ready",
    webhook_endpoint: `${baseUrl}/telex/a2a/{channelId}/message`,
    a2a_endpoint: `${baseUrl}/telex/a2a/agent/techPulse`,
    instructions: "Use the webhook endpoint for current setup, or A2A endpoint for Mastra node format"
  });
});

export default router;
