// controllers/newsController.js
import { techPulseAgent } from "../mastra.js";

/**
 * Fetch latest tech news (for direct API testing, optional)
 */
export const getTechNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const tools = await techPulseAgent.getTools();
    if (!tools?.getTechNews) {
      return res.status(503).json({ error: "News service unavailable" });
    }

    const result = await tools.getTechNews.execute({ limit });
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error("Direct news fetch error:", error);
    res.status(500).json({ error: error.message });
  }
};
