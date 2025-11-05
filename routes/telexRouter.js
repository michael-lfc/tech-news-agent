import express from "express";
import { fetchTechNews } from "../controllers/newsController.js";

const router = express.Router();

router.post("/command", async (req, res) => {
  try {
    const { method, params, id } = req.body;
    console.log("📩 Incoming Telex request:", req.body);

    if (method === "getTechNews") {
      const limit = params?.limit || 3;
      const articles = await fetchTechNews(limit);

      return res.json({
        jsonrpc: "2.0",
        result: { event: { text: "📰 Latest tech news", articles } },
        id: id || null,
      });
    }

    res.json({
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not found" },
      id: id || null,
    });
  } catch (err) {
    console.error("💥 Error handling Telex command:", err);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal server error", data: err.message },
      id: req.body?.id || null,
    });
  }
});

export default router;
