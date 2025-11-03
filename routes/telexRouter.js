import express from "express";
import { mastra } from "../mastra.js";

const router = express.Router();

/**
 * ⚡ POST: Main route for Telex A2A calls - Now using Mastra workflow
 */
router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    // Execute the Mastra workflow
    const result = await mastra.executeWorkflow("tech-news-workflow", {
      trigger: req.body
    });

    console.log("✅ Workflow execution result:", result);
    
    // Mastra should handle the JSON-RPC response format through the workflow
    res.json(result);

  } catch (error) {
    console.error("❌ Workflow execution error:", error);
    
    // Provide proper JSON-RPC error response
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: `Workflow execution failed: ${error.message}`
      },
      id: req.body?.id || null
    });
  }
});

/**
 * 🧠 Health check for Telex integration
 */
router.get("/command", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Telex Tech News Agent with Mastra Workflow is active",
    workflow: "tech-news-workflow",
    usage: {
      method: "POST",
      path: "/telex/command", 
      description: "Send a message to trigger the Mastra workflow"
    }
  });
});

export default router;