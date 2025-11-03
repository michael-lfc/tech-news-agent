import { techNewsAgent } from "../mastra.js";

export const getTechNews = async (req, res) => {
  try {
    let body = req.body;
    console.log("📩 Incoming from Telex:", JSON.stringify(body, null, 2));

    // Detect JSON-RPC structure
    const isJSONRPC = body.jsonrpc === "2.0" && body.method;
    if (isJSONRPC) {
      body = body.params || {};
    }

    const tools = await techNewsAgent.getTools();

    if (!tools?.getTechNews) {
      const msg = "⚠️ Tech News tool not available.";
      console.error(msg);
      return res.status(500).json({
        event: { text: msg },
      });
    }

    const result = await tools.getTechNews.execute({ limit: 5 });

    if (!result.success) {
      const msg = `❌ Failed to fetch tech news: ${result.error || "Unknown error"}`;
      console.error(msg);
      return res.status(500).json({
        event: { text: msg },
      });
    }

    const headlines = result.headlines
      .map((h, i) => `${i + 1}. ${h}`)
      .join("\n\n");

    const message = `📰 Top Tech Headlines:\n\n${headlines}\n\nSource: Tech News Agent`;

    // ✅ Telex-compatible format
    const reply = { event: { text: message } };

    if (isJSONRPC) {
      return res.json({
        jsonrpc: "2.0",
        id: body.id || req.body.id,
        result: reply,
      });
    }

    res.json(reply);
  } catch (err) {
    console.error("❌ getTechNews Error:", err);
    res.status(500).json({
      event: { text: `Internal error: ${err.message}` },
    });
  }
};
