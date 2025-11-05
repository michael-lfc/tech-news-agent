import express from "express";
import { techPulseAgent } from "../mastra.js";

const router = express.Router();

// Main Telex endpoint
router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    const { method, params = {}, id } = req.body;

    if (method === "getTechNews" || params.text?.toLowerCase().includes("news")) {
      console.log("📰 Processing news request...");

      const tools = await techPulseAgent.getTools();
      if (!tools?.getTechNews) {
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not available" },
          id
        });
      }

      const limit = params.limit || 5;
      const newsResult = await tools.getTechNews.execute({ limit });

      if (!newsResult.success) {
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32000, message: newsResult.error },
          id
        });
      }

      const headlines = newsResult.headlines
        .map((article, i) => `${i + 1}. **${article.title}**\n   📰 ${article.source} | 🔗 ${article.url}`)
        .join("\n\n");

      return res.json({
        jsonrpc: "2.0",
        result: { event: { text: `📰 **Latest Tech News**\n\n${headlines}` } },
        id
      });
    }

    // Default response
    res.json({
      jsonrpc: "2.0",
      result: { event: { text: "🤖 I'm TechPulse! Ask me for 'tech news'." } },
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

// Health check
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ TechPulse Agent is active",
    endpoints: ["POST /telex/command"],
    timestamp: new Date().toISOString()
  });
});

export default router;
