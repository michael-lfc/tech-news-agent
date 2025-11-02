Tech News Agent – Live AI Headlines in Telex.im
An intelligent AI co-worker powered by Mastra that delivers the latest technology headlines directly into your Telex.im channels — on demand.

Features

Real-time tech news from NewsAPI
Rich, clickable responses with Markdown formatting
Full A2A protocol compliance (Telex.im native integration)
Mastra workflow engine with visual trigger → agent → respond flow
Zero-config deployment – just add your API key and go


Live Demo
Try it in Telex.im:
@TechNews get tech news
Public Endpoint:
POST https://tech-news-agent.onrender.com/telex/command
Logs:
https://api.telex.im/agent-logs/chan_test_001.txt

Project Structure
tech-news-agent/
├── mastra.js              # Mastra agent + workflow loader
├── workflow.json          # Visual A2A flow (trigger → agent → respond)
├── routes/
│   └── telexRouter.js     # A2A endpoint (POST /telex/command)
├── controllers/
│   └── newsController.js  # Tool logic
├── app.js                 # Express server
├── .env                   # NEWS_API_KEY
└── package.json

Setup & Run Locally
bash# 1. Clone the repo
git clone https://github.com/yourusername/tech-news-agent.git
cd tech-news-agent

# 2. Install dependencies
npm install

# 3. Add your NewsAPI key
cp .env.example .env
# Edit .env → NEWS_API_KEY=your_key_here

# 4. Start the server
npm run dev
Server runs at: http://localhost:3000

Test with Postman
1. Create a New Request

Method: POST
URL: http://localhost:3000/telex/command

2. Headers
KeyValueContent-Typeapplication/json
3. Body → raw → JSON
json{
  "id": "msg_123",
  "text": "get tech news",
  "channel_id": "chan_test_001",
  "user_id": "user_999",
  "type": "message"
}
4. Send → Expected Response
json{
  "in_reply_to": "msg_123",
  "type": "message",
  "text": "Here are the top 5 tech headlines:",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*1.* <https://...|AI Breakthrough in Quantum Computing>\n_The Verge • Nov 3, 2025_"
      }
    }
    // ... 4 more
  ]
}

Mastra Workflow (workflow.json)
json{
  "nodes": [
    { "id": "telex-trigger", "type": "trigger", "platform": "telex", "position": [120, 80] },
    { "id": "tech-news-agent", "type": "agent", "agentId": "tech_news_agent", "position": [480, 80] },
    { "id": "send-response", "type": "respond", "platform": "telex", "position": [840, 80] }
  ],
  "edges": [ ... ]
}

Node positions use positive integers as required.


Deployment
Deploy in under 2 minutes with Render:

Push to GitHub
Connect repo in Render
Set env var: NEWS_API_KEY
Deploy → Done!


Built With

Mastra – AI agent framework
Node.js + Express – Backend
NewsAPI – Real-time headlines
Telex.im A2A Protocol – Native integration
Postman – API testing