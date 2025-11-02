// import axios from "axios";

// export const getTechNews = async (req, res) => {
// try {
// const apiKey = process.env.NEWS_API_KEY;
// if (!apiKey) throw new Error("NEWS_API_KEY is missing in .env");

// const response = await axios.get(
//   `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${apiKey}`
// );

// const headlines = response.data.articles.slice(0, 5).map((article, index) => ({
//   number: index + 1,
//   title: article.title,
//   source: article.source.name,
//   url: article.url,
//   publishedAt: article.publishedAt,
// }));

// res.json({ success: true, total: headlines.length, headlines });

// } catch (error) {
// console.error("Error fetching news:", error.response?.data || error.message);
// res.status(500).json({ success: false, error: "Failed to fetch tech news" });
// }
// };

// import { techNewsAgent } from "../mastra.js";

// export const getTechNews = async (req, res) => {
//   try {
//     const tools = techNewsAgent.getTools();
//     const response = await tools.getTechNews({ limit: 5 });

//     if (!response.success) {
//       return res.status(500).json({ success: false, error: response.error });
//     }

//     res.json({
//       success: true,
//       total: response.count,
//       headlines: response.headlines,
//     });
//   } catch (error) {
//     console.error("Error fetching news:", error.message);
//     res.status(500).json({ success: false, error: "Failed to fetch tech news" });
//   }
// };

// import { techNewsAgent } from "../mastra.js";

// export const getTechNews = async (req, res) => {
//   try {
//     // Use getTools() to access agent tools
//     const tools = techNewsAgent.getTools();
//     const getTechNewsTool = tools.find(tool => tool.name === "getTechNews");

//     if (!getTechNewsTool) {
//       return res.status(500).json({ success: false, error: "Tool not found in agent" });
//     }

//     const response = await getTechNewsTool.execute({ limit: 5 });

//     if (!response.success) {
//       return res.status(500).json({ success: false, error: response.error });
//     }

//     res.json({
//       success: true,
//       total: response.count,
//       headlines: response.headlines,
//     });
//   } catch (error) {
//     console.error("Error fetching news:", error.message);
//     res.status(500).json({ success: false, error: "Failed to fetch tech news" });
//   }
// };

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
