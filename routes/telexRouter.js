// // routes/telexRouter.js
// import express from "express";
// import { techNewsAgent } from "../mastra.js";

// const router = express.Router();

// router.post("/command", async (req, res) => {
//   try {
//     const { id, text, channel_id } = req.body;

//     if (!id || !text) {
//       return res.status(400).json({ error: "Invalid A2A message" });
//     }

//     const lowerText = text.toLowerCase().trim();
//     if (!lowerText.includes("tech news") && !lowerText.includes("news")) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "I only know how to fetch tech news. Try: *get tech news*",
//       });
//     }

//     const tools = techNewsAgent.getTools();
//     const result = await tools.getTechNews.execute({ limit: 5 });

//     if (!result.success) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "Sorry, I couldn't fetch news right now.",
//       });
//     }

//     const blocks = result.headlines.map((h, i) => ({
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
//           h.publishedAt
//         ).toLocaleDateString()} _`,
//       },
//     }));

//     res.json({
//       id: `reply_${Date.now()}`,
//       in_reply_to: id,
//       type: "message",
//       text: `Here are the top ${result.count} tech headlines:`,
//       blocks,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal error" });
//   }
// });

// export default router;


// import express from "express";
// import { techNewsAgent } from "../mastra.js";

// const router = express.Router();

// // Health check endpoint
// router.get("/command", (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     message: "Telex A2A endpoint is active and ready for POST messages.",
//     agent: "Tech News Agent",
//     trigger: "get tech news",
//     example_payload: {
//       id: "msg_123",
//       text: "get tech news",
//       channel_id: "chan_test_001",
//       user_id: "user_999",
//       type: "message",
//     },
//     postman_tip: "Use POST method to test!",
//     health_check: "OK",
//   });
// });

// // POST route for Telex A2A messages
// router.post("/command", async (req, res) => {
//   try {
//     const { id, text, channel_id } = req.body;

//     if (!id || !text) {
//       return res.status(400).json({ error: "Invalid A2A message format" });
//     }

//     const lowerText = text.toLowerCase().trim();

//     // Handle unsupported requests
//     if (!lowerText.includes("tech news") && !lowerText.includes("news")) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "I only know how to fetch tech news. Try: *get tech news*",
//       });
//     }

//     // ✅ Consistent async getTools
//     const tools = await techNewsAgent.getTools();

//     if (!tools || !tools.getTechNews) {
//       console.error("❌ getTechNews tool missing or undefined!");
//       return res.status(500).json({ error: "Tech News tool not available" });
//     }

//     const result = await tools.getTechNews.execute({ limit: 5 });

//     if (!result.success) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: result.error || "Sorry, I couldn't fetch news right now.",
//       });
//     }

//     const blocks = result.headlines.map((h, i) => ({
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
//           h.publishedAt
//         ).toLocaleDateString()}_`,
//       },
//     }));

//     return res.json({
//       id: `reply_${Date.now()}`,
//       in_reply_to: id,
//       type: "message",
//       text: `Here are the top ${result.count} tech headlines:`,
//       blocks,
//     });
//   } catch (err) {
//     console.error("❌ Telex Route Error:", err);
//     return res.status(500).json({ error: err.message || "Internal error" });
//   }
// });

// export default router;

// import express from "express";
// import { techNewsAgent } from "../mastra.js";

// const router = express.Router();

// // Health check endpoint
// router.get("/command", (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     message: "Telex A2A endpoint is active and ready for POST messages.",
//     agent: "Tech News Agent",
//     trigger: "get tech news",
//     example_payload: {
//       id: "msg_123",
//       text: "get tech news",
//       channel_id: "chan_test_001",
//       user_id: "user_999",
//       type: "message",
//     },
//     postman_tip: "Use POST method to test!",
//     health_check: "OK",
//   });
// });

// // POST route for Telex A2A / JSON-RPC messages
// router.post("/command", async (req, res) => {
//   try {
//     let body = req.body;

//     // Detect JSON-RPC and unwrap params
//     const isJSONRPC = body.jsonrpc === "2.0" && body.method;
//     if (isJSONRPC) {
//       body = body.params || {};
//     }

//     const { id, text, channel_id } = body;

//     if (!id || !text) {
//       const errorResponse = { code: -32600, message: "Invalid A2A message format" };
//       return isJSONRPC
//         ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, error: errorResponse })
//         : res.status(400).json({ error: "Invalid A2A message format" });
//     }

//     const lowerText = text.toLowerCase().trim();

//     // Handle unsupported requests
//     if (!lowerText.includes("tech news") && !lowerText.includes("news")) {
//       const reply = {
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "I only know how to fetch tech news. Try: *get tech news*",
//       };
//       return isJSONRPC ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, result: reply }) : res.json(reply);
//     }

//     // Fetch tool from techNewsAgent
//     const tools = await techNewsAgent.getTools();
//     if (!tools || !tools.getTechNews) {
//       console.error("❌ getTechNews tool missing or undefined!");
//       return res.status(500).json({ error: "Tech News tool not available" });
//     }

//     const result = await tools.getTechNews.execute({ limit: 5 });

//     if (!result.success) {
//       const reply = {
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: result.error || "Sorry, I couldn't fetch news right now.",
//       };
//       return isJSONRPC ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, result: reply }) : res.json(reply);
//     }

//     // Format headlines into Telex blocks
//     const blocks = result.headlines.map((h, i) => ({
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
//           h.publishedAt
//         ).toLocaleDateString()}_`,
//       },
//     }));

//     const reply = {
//       id: `reply_${Date.now()}`,
//       in_reply_to: id,
//       type: "message",
//       text: `Here are the top ${result.count} tech headlines:`,
//       blocks,
//     };

//     // Send response in correct format
//     return isJSONRPC ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, result: reply }) : res.json(reply);
//   } catch (err) {
//     console.error("❌ Telex Route Error:", err);
//     const errorResponse = { code: -32603, message: err.message || "Internal error" };
//     return res.status(500).json(
//       req.body.jsonrpc === "2.0"
//         ? { jsonrpc: "2.0", id: req.body.id, error: errorResponse }
//         : { success: false, error: err.message || "Internal error" }
//     );
//   }
// });

// export default router;

import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

// Health check endpoint for Telex
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Telex A2A endpoint is active and ready for POST messages.",
    agent: "Tech News Agent",
    trigger: "get tech news",
    example_payload: {
      id: "msg_123",
      text: "get tech news",
      channel_id: "chan_test_001",
      user_id: "user_999",
      type: "message",
    },
    postman_tip: "Use POST method to test!",
    health_check: "OK",
  });
});

// POST route for Telex A2A messages
router.post("/command", getTechNews);

export default router;
