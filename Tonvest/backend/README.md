# TONVest Backend

This is the backend API for TONVest, providing endpoints for AI-powered DeFi strategies, protocol data, and SBT minting.

## Endpoints
- `POST /strategy` — Get DeFi strategies for a user question (AI/Perplexity integration)
- `GET /defi-data` — Get DeFi protocol data (APY, TVL, etc.)
- `POST /sbt` — Mint or check SBT status (stub)

## Setup
```sh
cd backend
npm install
npm run dev
```

The server will run on port 4000 by default. 

## Environment Variables
Create a `.env` file in this directory with the following:

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Persistent Storage
User history and rewards are now stored persistently in `user_data.json` in the backend directory. Do not delete this file unless you want to reset all user data. 