// routes/newsRouter.js
import express from "express";
import { fetchTechNews, getTechNews } from "../controllers/newsController.js";

const router = express.Router();

// GET latest tech news (simple JSON)
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const articles = await fetchTechNews(limit);
    res.status(200).json({ articles });
  } catch (error) {
    console.error("💥 Error fetching news:", error.message);
    res.status(500).json({ error: "Failed to fetch tech news" });
  }
});

// JSON-RPC endpoint for POST/GET requests
router.all("/jsonrpc", getTechNews);

// 🔥 CRITICAL: This must be the LAST line
export default router;