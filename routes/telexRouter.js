// routes/telexRouter.js
import express from "express";
import { techNewsAgent } from "../mastra.js";

const router = express.Router();

router.post("/command", async (req, res) => {
  try {
    const { id, text, channel_id } = req.body;

    if (!id || !text) {
      return res.status(400).json({ error: "Invalid A2A message" });
    }

    const lowerText = text.toLowerCase().trim();
    if (!lowerText.includes("tech news") && !lowerText.includes("news")) {
      return res.json({
        id: `reply_${Date.now()}`,
        in_reply_to: id,
        type: "message",
        text: "I only know how to fetch tech news. Try: *get tech news*",
      });
    }

    const tools = techNewsAgent.getTools();
    const result = await tools.getTechNews.execute({ limit: 5 });

    if (!result.success) {
      return res.json({
        id: `reply_${Date.now()}`,
        in_reply_to: id,
        type: "message",
        text: "Sorry, I couldn't fetch news right now.",
      });
    }

    const blocks = result.headlines.map((h, i) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
          h.publishedAt
        ).toLocaleDateString()} _`,
      },
    }));

    res.json({
      id: `reply_${Date.now()}`,
      in_reply_to: id,
      type: "message",
      text: `Here are the top ${result.count} tech headlines:`,
      blocks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;