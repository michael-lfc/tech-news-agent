// // controllers/newsController.js
// import { techPulseAgent } from "../mastra.js";

// /**
//  * Fetch latest tech news (for direct API testing, optional)
//  */
// export const getTechNews = async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 5;

//     const tools = await techPulseAgent.getTools();
//     if (!tools?.getTechNews) {
//       return res.status(503).json({ error: "News service unavailable" });
//     }

//     const result = await tools.getTechNews.execute({ limit });
//     if (!result.success) {
//       return res.status(500).json({ error: result.error });
//     }

//     res.json(result);
//   } catch (error) {
//     console.error("Direct news fetch error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

import { techPulseAgent } from "../mastra.js";

/**

* Fetch latest tech news
* Handles both direct API calls (query param) and Telex calls (JSON-RPC)
  */
  export const getTechNews = async (req, res) => {
  try {
  // Determine limit for news (query param fallback to 5)
  const limit = parseInt(req.query.limit) || 5;

  // If request is from Telex, ensure jsonrpc exists
  const jsonrpc = req.body?.jsonrpc || null;

  if (req.body && !jsonrpc) {
  return res.status(400).json({
  error: "Bad Request: 'jsonrpc' field missing in request body"
  });
  }

  // Check if the tool exists
  const tools = await techPulseAgent.getTools();
  if (!tools?.getTechNews) {
  return res.status(503).json({ error: "News service unavailable" });
  }

  const result = await tools.getTechNews.execute({ limit });
  if (!result.success) {
  return res.status(500).json({ error: result.error });
  }

  // Respond differently if Telex JSON-RPC call
  if (jsonrpc) {
  return res.json({
  jsonrpc,
  result: {
  event: { text: result.dataText || "📰 Latest tech news unavailable" }
  },
  id: req.body.id || "telex_001"
  });
  }

  // Standard API response for direct queries
  res.json(result);
  } catch (error) {
  console.error("❌ getTechNews Error:", error);
  res.status(500).json({ error: error.message });
  }
  };
