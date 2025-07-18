import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { beginCell, toNano } from '@ton/core';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSwapTxParams, JettonSwapParams, Network, JettonRootAddresses } from '@ston-fi/sdk';

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

// --- Persistent storage with lowdb ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, '../user_data.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { userHistory: {}, userRewards: {} });
await db.read();

function saveDb() { return db.write(); }

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
  const { strategy, walletAddress, recipient, amount } = req.body;
  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid walletAddress' });
  }
  if (!strategy || typeof strategy !== 'object' || !strategy.title) {
    return res.status(400).json({ error: 'Missing or invalid strategy' });
  }

  // --- Real STON.fi swap integration for testnet ---
  if (strategy.type === 'swap') {
    try {
      // Example: swap TON to jUSDT on testnet
      const params = {
        userWalletAddress: walletAddress,
        offerJetton: JettonRootAddresses.TON, // TON
        askJetton: JettonRootAddresses.jUSDT, // jUSDT
        offerAmount: amount ? amount.toString() : '100000000', // 1 TON in nanotons
        network: Network.TESTNET,
      };
      const tx = await buildSwapTxParams(params);
      return res.json({
        status: 'STON.fi swap payload built',
        to: tx.to,
        value: tx.value,
        payload: tx.payload,
        strategy,
        walletAddress
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to build STON.fi swap payload', detail: e.message });
    }
  }

  // Record in user history
  db.data.userHistory[walletAddress] ||= [];
  db.data.userHistory[walletAddress].push({ strategy, timestamp: Date.now() });
  // Grant a mock reward
  db.data.userRewards[walletAddress] ||= [];
  db.data.userRewards[walletAddress].push({ type: 'star', detail: `Executed: ${strategy.title}`, timestamp: Date.now() });
  await saveDb();

  // --- TON testnet transfer payload (demo fallback) ---
  if (recipient && amount) {
    try {
      const transferAmount = toNano(amount.toString());
      const payload = beginCell()
        .storeUint(0, 32) // op code (0 = simple transfer)
        .storeUint(0, 64) // query id
        .endCell();
      // Return the payload as base64 for TonConnect
      return res.json({
        status: 'Testnet transfer payload built',
        to: recipient,
        value: transferAmount.toString(),
        payload: payload.toBoc().toString('base64'),
        strategy,
        walletAddress
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to build TON payload', detail: e.message });
    }
  }

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
  res.json({ walletAddress, history: db.data.userHistory[walletAddress] || [] });
});

// --- GET /rewards ---
app.get('/rewards', async (req, res) => {
  const walletAddress = req.walletAddress;
  if (!walletAddress) return res.status(400).json({ error: 'Missing walletAddress' });
  res.json({ walletAddress, rewards: db.data.userRewards[walletAddress] || [] });
});

// POST /sbt - SBT minting/status (stub)
app.post('/sbt', (req, res) => {
  res.json({ status: 'SBT minted (stub)' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TONVest backend listening on port ${PORT}`);
}); 