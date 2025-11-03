// // app.js
// import dotenv from "dotenv";
// dotenv.config(); // ✅ Load environment variables first

// import express from "express";
// import cors from "cors";
// import { mastra } from "./mastra.js"; // ✅ Initialize Mastra before routes

// import newsRouter from "./routes/newsRouter.js";
// import telexRouter from "./routes/telexRouter.js";

// const app = express();
// const PORT = process.env.PORT || 3000;

// // ✅ Middleware
// app.use(cors());
// app.use(express.json({ limit: "1mb" })); // safer body size limit

// // ✅ Mastra initialization log
// if (mastra) {
//   console.log("🧠 Mastra initialized successfully with Tech News Agent.");
// } else {
//   console.warn("⚠️ Mastra initialization failed or not detected.");
// }

// // ✅ Routes
// app.use("/news", newsRouter);
// app.use("/telex", telexRouter);

// // ✅ Root route
// app.get("/", (req, res) => {
//   res.status(200).json({
//     status: "online",
//     message: "✅ Tech News Agent API is running smoothly...",
//     endpoints: {
//       news: "/news",
//       telex_command: "/telex/command",
//     },
//     usage: {
//       example_telex_trigger: "POST /telex/command",
//       example_postman_payload: {
//         jsonrpc: "2.0",
//         method: "getTechNews",
//         params: { limit: 5 },
//         id: "msg_12345",
//       },
//     },
//   });
// });

// // ✅ 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     error: "Route not found",
//     available_routes: ["/", "/news", "/telex/command"],
//   });
// });

// // ✅ Global error handler (important for Telex)
// app.use((err, req, res, next) => {
//   console.error("💥 Unexpected Server Error:", err.stack || err.message);
//   res.status(500).json({
//     event: { text: `Internal Server Error: ${err.message}` },
//   });
// });

// // ✅ Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// app.js
import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables first

import express from "express";
import cors from "cors";
import { mastra } from "./mastra.js"; // ✅ Initialize Mastra before routes

import newsRouter from "./routes/newsRouter.js";
import telexRouter from "./routes/telexRouter.js";
// import { telexRouter } from "./routes/telexRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enhanced Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://telex.im', 'https://api.telex.im'] 
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "1mb" })); // safer body size limit

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ✅ Mastra initialization check (enhanced)
app.use((req, res, next) => {
  if (!mastra) {
    console.error("❌ Mastra not initialized - check configuration");
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Mastra AI system is not initialized"
    });
  }
  next();
});

console.log("🧠 Mastra initialized successfully with Tech News Agent & A2A Workflow");

// ✅ Health check endpoint (for monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Tech News Agent API",
    mastra: mastra ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// ✅ Routes
app.use("/news", newsRouter);
app.use("/telex", telexRouter);

// ✅ Enhanced Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    service: "Tech News Agent API",
    message: "✅ API is running smoothly with Mastra workflow integration",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      news: "/news",
      telex_integration: "/telex/command",
      docs: "See README.md for full documentation"
    },
    workflow: {
      name: "tech-news-workflow",
      description: "Mastra-powered AI agent for tech news delivery"
    },
    usage: {
      telex_integration: "POST /telex/command",
      example_webhook_payload: {
        jsonrpc: "2.0",
        method: "message",
        params: { text: "get tech news" },
        id: "msg_12345"
      }
    }
  });
});

// ✅ Enhanced 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    available_routes: [
      "GET /",
      "GET /health", 
      "GET /news",
      "GET /telex/command",
      "POST /telex/command"
    ],
    documentation: "Check / endpoint for API usage examples"
  });
});

// ✅ Enhanced Global error handler (critical for Telex integration)
app.use((err, req, res, next) => {
  console.error("💥 Global Error Handler:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // JSON-RPC 2.0 error response for Telex endpoints
  if (req.path.startsWith('/telex')) {
    return res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal server error",
        data: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      id: req.body?.id || null
    });
  }

  // Standard error response for other endpoints
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received - shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received - shutting down gracefully');
  process.exit(0);
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Tech News Agent API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}`);
  console.log(`🧠 Mastra Workflow: tech-news-workflow`);
  console.log(`📰 News API: ${process.env.NEWS_API_KEY ? 'configured' : 'MISSING - check .env'}`);
});

export default server;