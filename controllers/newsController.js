// controllers/newsController.js
import axios from "axios";

export const getTechNews = async (req, res) => {
  try {
    // Extract limit from request (default 5)
    const limit = req.body?.params?.limit || req.query.limit || 5;
    const id = req.body?.id || req.query.id || null;

    // Fetch from NewsAPI
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&apiKey=${process.env.NEWS_API_KEY}`
    );

    const articles = response.data.articles.map(article => ({
      title: article.title,
      url: article.url,
      source: article.source.name
    }));

    console.log("✅ Tech news fetched successfully");

    // JSON-RPC response for Telex POST
    if (req.method === "POST") {
      return res.status(200).json({
        jsonrpc: "2.0",
        result: { event: { text: "📰 Latest tech news", articles } },
        id
      });
    }

    // Standard JSON for GET
    res.status(200).json({ articles });
  } catch (error) {
    console.error("💥 Error fetching tech news:", error.message);
    const id = req.body?.id || req.query.id || null;

    return res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal server error: failed to fetch news" },
      id
    });
  }
};
