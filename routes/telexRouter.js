// routes/telexRouter.js
import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

/**
 * 🧠 Telex command endpoint
 * Receives JSON-RPC requests from Telex
 * Example payload:
 * {
 *   "jsonrpc": "2.0",
 *   "method": "getTechNews",
 *   "params": { "text": "get tech news", "limit": 3 },
 *   "id": "msg_123"
 * }
 */
router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    // Only process getTechNews method
    if (req.body.method === "getTechNews") {
      return getTechNews(req, res); // Reuse controller logic
    }

    // Respond if method not supported
    return res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not found" },
      id: req.body.id || null
    });
  } catch (error) {
    console.error("💥 Error in Telex router:", error.message);
    return res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal server error" },
      id: req.body?.id || null
    });
  }
});

// Optional health check for Telex integration
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Telex command endpoint is active",
    usage_example: {
      method: "POST",
      body: {
        jsonrpc: "2.0",
        method: "getTechNews",
        params: { text: "get tech news", limit: 3 },
        id: "msg_123"
      }
    }
  });
});

export default router;
