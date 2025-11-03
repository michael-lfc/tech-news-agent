router.post("/command", async (req, res) => {
  try {
    console.log("📩 Incoming Telex request:", JSON.stringify(req.body, null, 2));

    const { method, params = {}, id } = req.body;
    
    if (method === "getTechNews" || params.text?.toLowerCase().includes('news')) {
      console.log("📰 Processing news request...");
      
      const tools = await techNewsAgent.getTools();
      
      if (!tools?.getTechNews) {
        console.error("❌ News tool not available");
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not available" },
          id
        });
      }

      const limit = params.limit || 5;
      console.log(`🔍 Fetching ${limit} news headlines...`);
      
      const newsResult = await tools.getTechNews.execute({ limit });
      console.log("📊 News result:", newsResult);
      
      if (!newsResult.success) {
        console.error("❌ News API failed:", newsResult.error);
        return res.json({
          jsonrpc: "2.0",
          error: { code: -32000, message: newsResult.error },
          id
        });
      }

      // Format response
      const headlines = newsResult.headlines.map((article, index) => 
        `${index + 1}. **${article.title}**\n   📰 ${article.source} | 🔗 ${article.url}`
      ).join('\n\n');

      const responseText = `📰 **Latest Tech News**\n\n${headlines}`;
      
      console.log("✅ Sending successful response");
      
      return res.json({
        jsonrpc: "2.0",
        result: {
          event: { text: responseText }
        },
        id
      });
    }

    // Default response for other methods
    console.log("ℹ️ Sending help response");
    res.json({
      jsonrpc: "2.0",
      result: {
        event: { 
          text: "🤖 I'm Tech News Agent! Ask me for 'tech news' to get the latest headlines." 
        }
      },
      id
    });

  } catch (error) {
    console.error("❌ Telex command error:", error);
    res.json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal error" },
      id: req.body?.id || null
    });
  }
});