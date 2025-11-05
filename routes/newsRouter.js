// routes/newsRouter.js
import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

// ✅ Health check
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Tech News endpoint is active",
    example_payload: {
      method: "POST",
      body: {
        id: "msg_123",
        text: "get tech news",
        channel_id: "chan_test_001",
        user_id: "user_999",
        type: "message"
      }
    }
  });
});

// POST route for Telex / API
router.post("/", getTechNews);

export default router;
