// import express from "express";
// import { getTechNews } from "../controllers/newsController.js";

// const router = express.Router();

// router.get("/", getTechNews);

// export default router;

// import express from "express";
// import { getTechNews } from "../controllers/newsController.js";

// const router = express.Router();

// // Health check route
// router.get("/", (req, res) => {
//   res.status(200).json({
//     status: "ok",
//     message: "Tech News endpoint is active and ready for requests.",
//     example_payload: {
//       method: "POST",
//       body: {
//         id: "msg_123",
//         text: "get tech news",
//         channel_id: "chan_test_001",
//         user_id: "user_999",
//         type: "message",
//       },
//       postman_tip: "Use POST method to test fetching news!",
//     },
//     health_check: "OK",
//   });
// });

// // POST route to fetch tech news
// router.post("/", getTechNews);

// export default router;

import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

// Health check route
router.get("/", (req, res) => {
res.status(200).json({
status: "ok",
message: "Tech News endpoint is active and ready for requests.",
example_payload: {
method: "POST",
body: {
id: "msg_123",
text: "get tech news",
channel_id: "chan_test_001",
user_id: "user_999",
type: "message",
params: { limit: 3 }
},
postman_tip: "Use POST method to test fetching news!",
},
health_check: "OK",
});
});

// GET route for fetching news
router.get("/fetch", getTechNews); // optional separate GET endpoint

// POST route for fetching tech news (Telex JSON-RPC)
router.post("/", getTechNews);

export default router;
