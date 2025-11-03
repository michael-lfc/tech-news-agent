// import { techNewsAgent } from "../mastra.js";

// export const getTechNews = async (req, res) => {
//   try {
//     let body = req.body;
//     console.log("📩 Incoming from Telex:", JSON.stringify(body, null, 2));

//     // Detect JSON-RPC structure
//     const isJSONRPC = body.jsonrpc === "2.0" && body.method;
//     if (isJSONRPC) {
//       body = body.params || {};
//     }

//     const tools = await techNewsAgent.getTools();

//     if (!tools?.getTechNews) {
//       const msg = "⚠️ Tech News tool not available.";
//       console.error(msg);
//       return res.status(500).json({
//         event: { text: msg },
//       });
//     }

//     const result = await tools.getTechNews.execute({ limit: 5 });

//     if (!result.success) {
//       const msg = `❌ Failed to fetch tech news: ${result.error || "Unknown error"}`;
//       console.error(msg);
//       return res.status(500).json({
//         event: { text: msg },
//       });
//     }

//     const headlines = result.headlines
//       .map((h, i) => `${i + 1}. ${h}`)
//       .join("\n\n");

//     const message = `📰 Top Tech Headlines:\n\n${headlines}\n\nSource: Tech News Agent`;

//     // ✅ Telex-compatible format
//     const reply = { event: { text: message } };

//     if (isJSONRPC) {
//       return res.json({
//         jsonrpc: "2.0",
//         id: body.id || req.body.id,
//         result: reply,
//       });
//     }

//     res.json(reply);
//   } catch (err) {
//     console.error("❌ getTechNews Error:", err);
//     res.status(500).json({
//       event: { text: `Internal error: ${err.message}` },
//     });
//   }
// };

import { techNewsAgent } from "../mastra.js";

export const getTechNews = async (req, res) => {
  try {
    console.log("📩 Incoming request:", JSON.stringify(req.body, null, 2));

    // 🔹 Handle JSON-RPC requests gracefully
    let body = req.body;
    const isJSONRPC = body.jsonrpc === "2.0" && body.method;
    if (isJSONRPC) {
      body = body.params || {};
    }

    console.log("🧠 Getting tools from techNewsAgent...");
    const tools = await techNewsAgent.getTools();
    console.log("🧰 Tools loaded:", Object.keys(tools || {}));

    if (!tools || !tools.getTechNews) {
      const msg = "⚠️ Tech News tool not available.";
      console.error(msg);
      return res.status(500).json({ event: { text: msg } });
    }

    console.log("🚀 Executing getTechNews tool...");
    const result = await tools.getTechNews.execute({ limit: 5 });
    console.log("📦 Tool result:", result);

    if (!result || !result.success) {
      const msg = `❌ Failed to fetch tech news: ${result?.error || "Unknown error"}`;
      console.error(msg);
      return res.status(500).json({ event: { text: msg } });
    }

    const headlines = result.headlines?.length
      ? result.headlines.map((h, i) => `${i + 1}. ${h}`).join("\n\n")
      : "No headlines found.";

    const message = `📰 Top Tech Headlines:\n\n${headlines}\n\nSource: Tech News Agent`;
    const reply = { event: { text: message } };

    // ✅ Respond with JSON-RPC or plain JSON
    if (isJSONRPC) {
      return res.json({
        jsonrpc: "2.0",
        id: body.id || req.body.id,
        result: reply,
      });
    }

    res.json(reply);
  } catch (err) {
    console.error("💥 getTechNews Error:", err);
    res.status(500).json({
      event: { text: `Internal error: ${err.message}` },
    });
  }
};
