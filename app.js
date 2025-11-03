// app.js
import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables first

import express from "express";
import cors from "cors";
import { mastra } from "./mastra.js"; // ✅ Initialize Mastra before routes

import newsRouter from "./routes/newsRouter.js";
import telexRouter from "./routes/telexRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" })); // safer body size limit

// ✅ Mastra initialization log
if (mastra) {
  console.log("🧠 Mastra initialized successfully with Tech News Agent.");
} else {
  console.warn("⚠️ Mastra initialization failed or not detected.");
}

// ✅ Routes
app.use("/news", newsRouter);
app.use("/telex", telexRouter);

// ✅ Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "✅ Tech News Agent API is running smoothly...",
    endpoints: {
      news: "/news",
      telex_command: "/telex/command",
    },
    usage: {
      example_telex_trigger: "POST /telex/command",
      example_postman_payload: {
        jsonrpc: "2.0",
        method: "getTechNews",
        params: { limit: 5 },
        id: "msg_12345",
      },
    },
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    available_routes: ["/", "/news", "/telex/command"],
  });
});

// ✅ Global error handler (important for Telex)
app.use((err, req, res, next) => {
  console.error("💥 Unexpected Server Error:", err.stack || err.message);
  res.status(500).json({
    event: { text: `Internal Server Error: ${err.message}` },
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
