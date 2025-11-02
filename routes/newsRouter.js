// // routes/newsRouter.js
// import express from 'express';
// import { mastra } from '../mastra.js';

// const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//     // Find the agent by name
//     const agent = mastra.agents.find(a => a.name === 'tech_news_agent');

//     if (!agent) {
//       console.error('❌ Agent not found in Mastra!');
//       return res.status(500).json({ error: 'Agent not found in Mastra' });
//     }

//     // Generate tech news using the agent
//     const response = await agent.generate('Get me the latest 5 tech news headlines');

//     res.json({ success: true, total: 5, headlines: response.text });
//   } catch (error) {
//     console.error('Error fetching news:', error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch tech news. Check API key or network.'
//     });
//   }
// });

// export default router;

// import express from "express";
// import { getTechNews } from "../controllers/newsController.js";

// const router = express.Router();

// // GET /news
// router.get("/", getTechNews);

// export default router;

import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

router.get("/", getTechNews);

export default router;
