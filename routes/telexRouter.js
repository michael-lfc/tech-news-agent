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

// routes/telexRouter.js
// import express from "express";
// import { techNewsAgent } from "../mastra.js";

// const router = express.Router();

// router.post("/command", async (req, res) => {
//   try {
//     const { id, text } = req.body;

//     if (!id || !text) {
//       return res.status(400).json({ error: "Invalid A2A message" });
//     }

//     const lowerText = text.toLowerCase().trim();

//     // 🧠 Handle unsupported requests
//     if (!lowerText.includes("tech news") && !lowerText.includes("news")) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "I only know how to fetch tech news. Try: *get tech news*",
//       });
//     }

//     // ✅ FIX: Directly access the tool from the agent
//     const result = await techNewsAgent.tools.getTechNews.execute({ limit: 5 });

//     // 🧠 Handle API failure
//     if (!result.success) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "Sorry, I couldn't fetch tech news right now.",
//       });
//     }

//     // ✅ Make sure headlines exist before mapping
//     const headlines = result.headlines || [];

//     const blocks = headlines.map((h, i) => ({
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
//           h.publishedAt
//         ).toLocaleDateString()}_`,
//       },
//     }));

//     // ✅ Send the final message Telex expects
//     res.json({
//       id: `reply_${Date.now()}`,
//       in_reply_to: id,
//       type: "message",
//       text: `Here are the top ${result.count} tech headlines:`,
//       blocks,
//     });
//   } catch (err) {
//     console.error("❌ Telex Route Error:", err);
//     res.status(500).json({ error: "Internal error" });
//   }
// });

// export default router;

// routes/telexRouter.js
// import express from "express";
// import { techNewsAgent } from "../mastra.js";

// const router = express.Router();

// router.post("/command", async (req, res) => {
//   try {
//     const { id, text } = req.body;

//     if (!id || !text) {
//       return res.status(400).json({ error: "Invalid A2A message" });
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

//     // ✅ Correct and modern usage
//     const tools = await techNewsAgent.getTools();
//     const result = await tools.getTechNews.execute({ limit: 5 });

//     if (!result.success) {
//       return res.json({
//         id: `reply_${Date.now()}`,
//         in_reply_to: id,
//         type: "message",
//         text: "Sorry, I couldn't fetch news right now.",
//       });
//     }

//     const headlines = result.headlines || [];
//     const blocks = headlines.map((h, i) => ({
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
//           h.publishedAt
//         ).toLocaleDateString()}_`,
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
//     console.error("❌ Telex Route Error:", err);
//     res.status(500).json({ error: "Internal error" });
//   }
// });

// export default router;

// routes/telexRouter.js
import express from "express";
import { techNewsAgent } from "../mastra.js";

const router = express.Router();

router.post("/command", async (req, res) => {
  try {
    console.log("🔹 Incoming Request Body:", req.body);

    const { id, text, channel_id } = req.body;

    if (!id || !text) {
      return res.status(400).json({ error: "Invalid A2A message format" });
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

    console.log("🧠 Fetching tools from techNewsAgent...");
    const tools = techNewsAgent.getTools();

    if (!tools || !tools.getTechNews) {
      console.error("❌ getTechNews tool missing or undefined!");
      return res.status(500).json({ error: "Tech News tool not available" });
    }

    console.log("🚀 Executing getTechNews tool...");
    const result = await tools.getTechNews.execute({ limit: 5 });
    console.log("✅ Tool execution result:", result);

    if (!result.success) {
      return res.json({
        id: `reply_${Date.now()}`,
        in_reply_to: id,
        type: "message",
        text: result.error || "Sorry, I couldn't fetch news right now.",
      });
    }

    const blocks = result.headlines.map((h, i) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${i + 1}.* <${h.url}|${h.title}>\n_${h.source} • ${new Date(
          h.publishedAt
        ).toLocaleDateString()}_`,
      },
    }));

    return res.json({
      id: `reply_${Date.now()}`,
      in_reply_to: id,
      type: "message",
      text: `Here are the top ${result.count} tech headlines:`,
      blocks,
    });
  } catch (err) {
    console.error("❌ Full Error Trace:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
});

export default router;
