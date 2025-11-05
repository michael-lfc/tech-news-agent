// // // controllers/newsController.js
// // import { techPulseAgent } from "../mastra.js";

// // /**
// //  * Fetch latest tech news (for direct API testing, optional)
// //  */
// // export const getTechNews = async (req, res) => {
// //   try {
// //     const limit = parseInt(req.query.limit) || 5;

// //     const tools = await techPulseAgent.getTools();
// //     if (!tools?.getTechNews) {
// //       return res.status(503).json({ error: "News service unavailable" });
// //     }

// //     const result = await tools.getTechNews.execute({ limit });
// //     if (!result.success) {
// //       return res.status(500).json({ error: result.error });
// //     }

// //     res.json(result);
// //   } catch (error) {
// //     console.error("Direct news fetch error:", error);
// //     res.status(500).json({ error: error.message });
// //   }
// // };


// app.post('/tech-news', async (req, res) => {  // or app.all() if supporting both
//   try {
//     const articles = await fetchTechNews(); // ← You MUST define this!

//     const id = req.method === "POST" ? (req.body?.id ?? null) : (req.query.id ?? null);

//     const resultPayload = {
//       jsonrpc: "2.0",
//       result: { event: { text: "📰 Latest tech news", articles } },
//       id
//     };

//     console.log("✅ Tech news fetched successfully");

//     // Plain JSON for GET
//     if (req.method === "GET") {
//       return res.status(200).json({ articles });
//     }

//     // JSON-RPC for POST
//     return res.status(200).json(resultPayload);

//   } catch (error) {
//     console.error("💥 Error fetching tech news:", error.message);
//     const id = req.method === "POST" ? (req.body?.id ?? null) : (req.query.id ?? null);

//     return res.status(500).json({
//       jsonrpc: "2.0",
//       error: { code: -32603, message: "Internal server error: failed to fetch news" },
//       id
//     });
//   }
// });


import axios from "axios";

export const getTechNews = async (req, res) => {
  const id = req.method === "POST" ? req.body?.id ?? null : req.query.id ?? null;
  try {
    const limit = req.body?.params?.limit || req.query?.limit || 3;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) throw new Error("NEWS_API_KEY missing");

    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${apiKey}`
    );

    const articles = response.data.articles.map(a => ({
      title: a.title,
      url: a.url,
      source: a.source.name
    }));

    // JSON-RPC response for POST
    if (req.method === "POST") {
      return res.status(200).json({
        jsonrpc: "2.0",
        result: { event: { text: "📰 Latest tech news", articles } },
        id
      });
    }

    // Plain JSON for GET
    res.status(200).json({ articles });

  } catch (error) {
    console.error("💥 Error fetching news:", error.message);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal server error" },
      id
    });
  }
};
