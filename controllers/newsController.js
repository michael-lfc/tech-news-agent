import { techNewsAgent } from "../mastra.js";

export const getTechNews = async (req, res) => {
  try {
    let body = req.body;
    console.log("📩 Incoming payload:", JSON.stringify(body, null, 2));

    // ✅ Detect JSON-RPC calls (from Telex)
    const isJSONRPC = body.jsonrpc === "2.0" && (body.method || body.params);
    const requestParams = isJSONRPC ? body.params || {} : body;

    console.log("⚙️  Parsed Request Params:", requestParams);

    // ✅ Fetch tools from the registered agent
    const tools = await techNewsAgent.getTools();
    if (!tools || typeof tools.getTechNews?.execute !== "function") {
      const msg = "⚠️ Tech News tool not available or not properly registered.";
      console.error(msg);
      return res.status(500).json({
        event: { text: msg },
      });
    }

    console.log("🚀 Executing Tech News Tool...");

    // ✅ Execute tool with safe defaults
    const result = await tools.getTechNews.execute({ limit: 5 });

    console.log("🧩 Tool Execution Result:", result);

    if (!result || result.success === false) {
      const msg = `❌ Failed to fetch tech news: ${result?.error || "Unknown error"}`;
      console.error(msg);
      return res.status(500).json({
        event: { text: msg },
      });
    }

    // ✅ Normalize headlines (string or object)
    const headlines = Array.isArray(result.headlines)
      ? result.headlines
          .map((h, i) => {
            if (typeof h === "string") return `${i + 1}. ${h}`;
            if (typeof h === "object" && h.title)
              return `${i + 1}. ${h.title}${h.url ? `\n🔗 ${h.url}` : ""}`;
            return `${i + 1}. ${JSON.stringify(h)}`;
          })
          .join("\n\n")
      : "No valid headlines found.";

    const message = `📰 *Top Tech Headlines:*\n\n${headlines}\n\n_Source: Tech News Agent_`;

    const reply = { event: { text: message } };

    // ✅ Respond appropriately for Telex JSON-RPC
    if (isJSONRPC) {
      return res.json({
        jsonrpc: "2.0",
        id: body.id || null,
        result: reply,
      });
    }

    // ✅ Standard REST API response
    res.json(reply);
  } catch (err) {
    console.error("💥 Controller Error:", err);
    res.status(500).json({
      event: { text: `Internal error: ${err.message || "Unexpected failure"}` },
    });
  }
};
