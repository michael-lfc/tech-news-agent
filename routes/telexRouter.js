import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

/**
 * 🧠 Health check for Telex integration
 * - Verifies the agent route is live and reachable
 * - Can be tested directly in Postman or browser
 */
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Telex Tech News Agent is active and ready for POST commands.",
    usage: {
      method: "POST",
      path: "/command",
      description: "Send a command from Telex or Postman to fetch tech news.",
    },
    example_postman_body: {
      jsonrpc: "2.0",
      method: "getTechNews",
      params: { limit: 5 },
      id: "msg_12345",
    },
    tip: "Use POST method for Telex workflow integration.",
  });
});

/**
 * ⚡ POST: Main route for Telex A2A calls
 * This endpoint handles both:
 * - Regular JSON POSTs (from Postman)
 * - JSON-RPC structured payloads (from Telex)
 */
router.post("/command", getTechNews);

export default router;
