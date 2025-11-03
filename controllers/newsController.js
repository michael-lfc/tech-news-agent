import { techNewsAgent } from "../mastra.js";

export const getTechNews = async (req, res) => {
  try {
    let body = req.body;

    // Detect JSON-RPC
    const isJSONRPC = body.jsonrpc === "2.0" && body.method;
    if (isJSONRPC) {
      body = body.params || {};
    }

    const { id } = body;

    // Fetch tool from techNewsAgent
    const tools = await techNewsAgent.getTools();
    if (!tools || !tools.getTechNews) {
      const errorResponse = { code: -32601, message: "Tech News tool not available" };
      return isJSONRPC
        ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, error: errorResponse })
        : res.status(500).json({ success: false, error: "Tech News tool not available" });
    }

    const result = await tools.getTechNews.execute({ limit: 5 });

    if (!result.success) {
      const reply = { success: false, error: result.error || "Failed to fetch tech news" };
      return isJSONRPC
        ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, result: reply })
        : res.status(500).json(reply);
    }

    const reply = {
      success: true,
      total: result.count,
      headlines: result.headlines,
    };

    return isJSONRPC
      ? res.json({ jsonrpc: "2.0", id: body.id || req.body.id, result: reply })
      : res.json(reply);
  } catch (err) {
    console.error("❌ getTechNews Error:", err);
    const errorResponse = { code: -32603, message: err.message || "Internal error" };
    return res.status(500).json(
      req.body.jsonrpc === "2.0"
        ? { jsonrpc: "2.0", id: req.body.id, error: errorResponse }
        : { success: false, error: err.message || "Internal error" }
    );
  }
};
