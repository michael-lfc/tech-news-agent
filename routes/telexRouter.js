import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

/**
 * 🧠 Health check for Telex integration
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
 */
router.post("/command", getTechNews);

/**
 * 🟢 Debug route (temporary)
 * Logs incoming Telex requests for troubleshooting
 */
router.post("/debug", (req, res) => {
  console.log("🟢 Telex Debug Body:", JSON.stringify(req.body, null, 2));
  console.log("🟢 Telex Debug Headers:", req.headers);
  res.json({ status: "ok", message: "Body logged to console" });
});

export default router;
