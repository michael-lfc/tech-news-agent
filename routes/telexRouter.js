// telexRouter.js
import express from "express";
import { techPulseAgent } from "../mastra.js";

const router = express.Router();

router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    const { method, params = {}, id } = req.body;

    // Only handle tech news requests
    if (method === "getTechNews" || params.text?.toLowerCase().includes("news")) {
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

      // Format headlines into a text string Telex can display
      const headlines = newsResult.headlines
        .map(
          (article, index) =>
            `${index + 1}. **${article.title}**\n   📰 ${article.source} | 🔗 ${article.url}`
        )
        .join("\n\n");

      const responseText = `📰 **Latest Tech News**\n\n${headlines}`;

      return res.json({
        jsonrpc: "2.0",
        result: { event: { text: responseText } },
        id
      });
    }

    // Default response for other messages
    res.json({
      jsonrpc: "2.0",
      result: {
        event: {
          text: "🤖 I'm TechPulse! Ask me for 'tech news' to get the latest headlines."
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

export default router;
