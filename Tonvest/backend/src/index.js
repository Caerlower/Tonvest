import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// --- New: Middleware to extract wallet address from request (if provided) ---
app.use((req, res, next) => {
  req.walletAddress = req.headers['x-wallet-address'] || req.body?.walletAddress || null;
  next();
});

// Health check
app.get('/health', (req, res) => res.send('TONVest backend running'));

// POST /strategy - Robust Perplexity API integration with code block stripping
app.post('/strategy', async (req, res) => {
  const { question } = req.body;
  try {
    const perplexityRes = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [
          { role: 'system', content: `You are an expert DeFi strategist for the TON blockchain. ALWAYS respond ONLY with a valid JSON object with this structure: { "answer": "summary of your advice", "strategies": [ { "title": "...", "description": "...", "apy": "...", "tvl": "..." } ] } Do not include any markdown, explanation, or text outside the JSON. Do not use triple backticks. Only output valid JSON.` },
          { role: 'user', content: question }
        ],
        max_tokens: 512,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    let rawContent = perplexityRes.data.choices[0].message.content;
    console.log('Raw AI response:', rawContent);
    // Remove triple backticks and optional 'json' tag
    rawContent = rawContent.trim();
    if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```json|^```/, '').replace(/```$/, '').trim();
    }
    let aiData;
    try {
      aiData = JSON.parse(rawContent);
      if (!aiData.answer || !Array.isArray(aiData.strategies)) {
        throw new Error('AI response missing required fields.');
      }
      res.json(aiData);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e.message);
      res.status(500).json({ error: 'AI response was not valid JSON or missing required fields.', raw: rawContent });
    }
  } catch (err) {
    console.error('Failed to fetch from Perplexity API:', err.message);
    res.status(500).json({ error: 'Failed to fetch from Perplexity API', details: err.message });
  }
});

// --- In-memory stores for demo (replace with DB in production) ---
const userHistory = new Map(); // walletAddress -> [{ strategy, timestamp }]
const userRewards = new Map(); // walletAddress -> [{ type, detail, timestamp }]

// --- GET /defi-data ---
app.get('/defi-data', async (req, res) => {
  // TODO: Replace with real API or on-chain fetch
  res.json({
    protocols: [
      { name: 'STON.fi', apy: '7.2%', tvl: '12M', pools: 8, url: 'https://ston.fi' },
      { name: 'DeDust', apy: '5.8%', tvl: '8.5M', pools: 5, url: 'https://dedust.io' },
      { name: 'Tonstakers', apy: '4.1%', tvl: '3.2M', pools: 1, url: 'https://tonstakers.com' },
    ]
  });
});

// --- POST /execute-strategy ---
app.post('/execute-strategy', async (req, res) => {
  const { strategy, walletAddress } = req.body;
  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid walletAddress' });
  }
  if (!strategy || typeof strategy !== 'object' || !strategy.title) {
    return res.status(400).json({ error: 'Missing or invalid strategy' });
  }
  // Record in user history
  const hist = userHistory.get(walletAddress) || [];
  hist.push({ strategy, timestamp: Date.now() });
  userHistory.set(walletAddress, hist);
  // Grant a mock reward
  const rewards = userRewards.get(walletAddress) || [];
  rewards.push({ type: 'star', detail: `Executed: ${strategy.title}`, timestamp: Date.now() });
  userRewards.set(walletAddress, rewards);
  // TODO: Build and return a real TON transaction payload or interact with smart contract
  res.json({
    status: 'Strategy execution simulated',
    txPayload: 'MOCK_TX_BASE64==',
    strategy,
    walletAddress
  });
});

// --- GET /history ---
app.get('/history', async (req, res) => {
  const walletAddress = req.walletAddress;
  if (!walletAddress) return res.status(400).json({ error: 'Missing walletAddress' });
  res.json({ walletAddress, history: userHistory.get(walletAddress) || [] });
});

// --- GET /rewards ---
app.get('/rewards', async (req, res) => {
  const walletAddress = req.walletAddress;
  if (!walletAddress) return res.status(400).json({ error: 'Missing walletAddress' });
  res.json({ walletAddress, rewards: userRewards.get(walletAddress) || [] });
});

// POST /sbt - SBT minting/status (stub)
app.post('/sbt', (req, res) => {
  res.json({ status: 'SBT minted (stub)' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TONVest backend listening on port ${PORT}`);
}); 