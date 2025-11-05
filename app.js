import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { mastra } from "./mastra.js";
import newsRouter from "./routes/newsRouter.js";
import telexRouter from "./routes/telexRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Mastra check
app.use((req, res, next) => {
  if (!mastra) {
    console.error("❌ Mastra not initialized");
    return res.status(503).json({ error: "Mastra not initialized" });
  }
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", mastra: !!mastra });
});

// Routes
app.use("/news", newsRouter);
app.use("/telex", telexRouter);

// Root
app.get("/", (req, res) => {
  res.status(200).json({ message: "Tech News API running ✅" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
