import { techNewsAgent } from "../mastra.js";

export const getTechNews = async (req, res) => {
  try {
    const tools = techNewsAgent.getTools();
    const getTechNewsTool = tools.getTechNews;

    if (!getTechNewsTool) {
      return res.status(500).json({ success: false, error: "Tool not found in agent" });
    }

    const response = await getTechNewsTool.execute({ limit: 5 });

    if (!response.success) {
      return res.status(500).json({ success: false, error: response.error });
    }

    res.json({
      success: true,
      total: response.count,
      headlines: response.headlines,
    });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch tech news" });
  }
};
