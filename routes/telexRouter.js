// routes/telexRouter.js
import express from "express";
import axios from "axios";
import { fetchTechNews } from "../controllers/newsController.js";

const router = express.Router();

// Webhook registration info endpoint
router.get("/register", async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const webhookUrl = `${baseUrl}/telex/a2a/{channelId}/message`;
    
    const registrationInfo = {
      status: "ready_for_registration",
      instructions: "Register this webhook URL in your Telex developer portal:",
      webhook_url: webhookUrl,
      endpoints: {
        message_webhook: `${baseUrl}/telex/a2a/{channelId}/message`,
        event_webhook: `${baseUrl}/telex/a2a/{channelId}/event`
      },
      steps: [
        "1. Go to Telex developer portal",
        "2. Find webhook settings for your channel",
        "3. Set the webhook URL to the URL below",
        "4. Replace {channelId} with your actual channel ID", 
        "5. Save changes and test with a message containing 'news'"
      ],
      notes: [
        "Your agent is currently deployed and accessible",
        "Make sure your channel ID is correctly substituted",
        "Test by sending a message like 'get tech news' in Telex"
      ],
      health_check: `${baseUrl}/health`,
      test_message: "Try sending: 'get tech news' or 'latest news'"
    };

    res.status(200).json(registrationInfo);
  } catch (error) {
    console.error("Registration info error:", error);
    res.status(500).json({ 
      error: "Failed to generate registration info",
      details: error.message 
    });
  }
});

// POST registration endpoint
router.post("/register", async (req, res) => {
  try {
    const { channelId, telexApiKey } = req.body;
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    if (!channelId) {
      return res.status(400).json({
        error: "channelId is required",
        example: { 
          channelId: "your_telex_channel_id",
          telexApiKey: "your_telex_api_key_optional" 
        }
      });
    }

    const webhookUrl = `${baseUrl}/telex/a2a/${channelId}/message`;
    const registrationResult = {
      success: true,
      message: "Use this information to register your webhook with Telex",
      channel_id: channelId,
      your_webhook_url: webhookUrl,
      registration_method: "manual",
      steps: [
        `1. Webhook URL: ${webhookUrl}`,
        "2. Login to Telex developer portal",
        "3. Navigate to your channel/webhook settings",
        "4. Paste the webhook URL above",
        "5. Save and test with a message containing 'news'"
      ]
    };

    // Try automated registration if API key provided
    if (telexApiKey) {
      try {
        const apiResponse = await axios.post(
          'https://api.telex.im/v1/webhooks',
          {
            url: webhookUrl,
            channel_id: channelId,
            events: ['message', 'message.created']
          },
          {
            headers: { 
              'Authorization': `Bearer ${telexApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        registrationResult.auto_registration = {
          success: true,
          response: apiResponse.data,
          method: "api_automated"
        };
        registrationResult.registration_method = "automated";
        
      } catch (apiError) {
        registrationResult.auto_registration = {
          success: false,
          error: apiError.response?.data || apiError.message,
          note: "Manual registration still available"
        };
      }
    }

    res.status(200).json(registrationResult);
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration process failed",
      details: error.message
    });
  }
});

// Telex A2A message endpoint - handles both GET and POST requests
router.all("/a2a/:channelId/message", async (req, res) => {
  try {
    const { channelId } = req.params;
    const isGet = req.method === 'GET';
    
    // Get data from either body (POST) or query (GET)
    const { text, user_id, id } = isGet ? req.query : req.body;

    console.log(`📩 ${req.method} Telex message from channel ${channelId}:`, text);

    if (text && text.toLowerCase().includes('news')) {
      const limit = text.toLowerCase().includes('latest') ? 5 : 3;
      const articles = await fetchTechNews(limit);
      
      const newsText = articles.map(article => 
        `📰 ${article.title}\n🔗 ${article.url}`
      ).join('\n\n');

      return res.json({
        jsonrpc: "2.0",
        result: {
          event: {
            text: `Here's your tech news:\n\n${newsText}`,
            channel_id: channelId,
            user_id: user_id
          }
        },
        id: id || null
      });
    }

    // Default help response
    res.json({
      jsonrpc: "2.0",
      result: {
        event: {
          text: "I can fetch the latest tech news for you! Try saying 'news' or 'tech news'",
          channel_id: channelId,
          user_id: user_id
        }
      },
      id: id || null
    });

  } catch (error) {
    console.error(`💥 ${req.method} Telex message processing error:`, error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { 
        code: -32603, 
        message: "Internal server error while processing news request" 
      },
      id: req.method === 'GET' ? req.query?.id : req.body?.id || null
    });
  }
});

// Test endpoint to verify webhook configuration
router.get("/test/:channelId", async (req, res) => {
  const { channelId } = req.params;
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  
  const testInfo = {
    message: "✅ Telex webhook endpoint is active and ready",
    channel_id: channelId,
    webhook_url: `${baseUrl}/telex/a2a/${channelId}/message`,
    supported_methods: ["GET", "POST"],
    status: "operational",
    timestamp: new Date().toISOString(),
    test_instructions: `Send a POST request to the webhook URL with:`,
    example_payload: {
      jsonrpc: "2.0",
      method: "message",
      params: {
        text: "get tech news",
        channel_id: channelId,
        user_id: "test_user_123"
      },
      id: "test_001"
    },
    get_test: `Or test GET: ${baseUrl}/telex/a2a/${channelId}/message?text=get+tech+news&user_id=test_user_123`
  };

  res.status(200).json(testInfo);
});

// Add a separate endpoint for test without channelId
router.get("/test", async (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  
  const testInfo = {
    message: "✅ Telex webhook endpoints are active",
    instructions: "Use /test/:channelId for specific channel testing",
    available_endpoints: {
      with_channel: `${baseUrl}/telex/test/your_channel_id`,
      registration: `${baseUrl}/telex/register`,
      health: `${baseUrl}/telex/health`
    },
    note: "Webhook endpoint now supports both GET and POST methods"
  };

  res.status(200).json(testInfo);
});

// Health check for Telex integration
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "telex-integration",
    timestamp: new Date().toISOString(),
    endpoints: {
      registration: "/telex/register",
      message_webhook: "/telex/a2a/{channelId}/message (GET & POST)",
      test: "/telex/test/{channelId}",
      health: "/telex/health"
    }
  });
});

export default router;