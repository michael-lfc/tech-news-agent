// app.js
import dotenv from "dotenv";
dotenv.config(); // Must come first

import express from "express";
import cors from "cors";
import { mastra } from './mastra.js';

import newsRouter from "./routes/newsRouter.js";
import telexRouter from "./routes/telexRouter.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/news", newsRouter);
app.use("/telex", telexRouter);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "✅ Tech News Agent is running...",
    endpoints: {
      news: "/news",
      telex: "/telex/command",
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
