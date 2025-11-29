// Zenzoro backend: live prices + 7-day history + static frontend

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files (index.html, app.js, styles.css)
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;

// Map short symbols to CoinGecko IDs
const COIN_MAP = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  bnb: "binancecoin",
  doge: "dogecoin"
};

// Simple in-memory cache to reduce API calls
const cache = {
  prices: null,       // { data: {...}, ts: timestamp }
  history: {}         // { [symbol]: { [days]: { data, ts } } }
};

const PRICES_TTL_MS = 60 * 1000;      // 1 minute cache for current prices
const HISTORY_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for history

function isFresh(entry, ttl) {
  if (!entry || !entry.ts) return false;
  return Date.now() - entry.ts < ttl;
}

// Health check
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", service: "Zenzoro backend", time: new Date().toISOString() });
});

// Single BTC price (kept for compatibility)
app.get("/api/price/btc", async (req, res) => {
  try {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
    const response = await fetch(url);
    const data = await response.json();

    res.json({ btc: data.bitcoin?.usd ?? null });
  } catch (error) {
    console.error("BTC price error:", error);
    res.status(500).json({ error: "Unable to fetch BTC price" });
  }
});

// Multi-coin prices
app.get("/api/prices", async (req, res) => {
  try {
    // Return cached if still fresh
    if (isFresh(cache.prices, PRICES_TTL_MS)) {
      return res.json(cache.prices.data);
    }

    const ids = Object.values(COIN_MAP).join(",");
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=" +
      ids +
      "&vs_currencies=usd";

    const response = await fetch(url);
    const data = await response.json();

    const result = {
      BTC: data.bitcoin?.usd ?? null,
      ETH: data.ethereum?.usd ?? null,
      SOL: data.solana?.usd ?? null,
      BNB: data.binancecoin?.usd ?? null,
      DOGE: data.dogecoin?.usd ?? null
    };

    cache.prices = { data: result, ts: Date.now() };

    res.json(result);
  } catch (error) {
    console.error("Multi-price error:", error);
    res.status(500).json({ error: "Unable to load crypto prices" });
  }
});

// 7-day history for a coin (hourly)
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toLowerCase();
    const id = COIN_MAP[symbol];

    if (!id) {
      return res.status(400).json({ error: "Unsupported coin symbol" });
    }

    const days = 7;

    // Create nested cache structure if needed
    if (!cache.history[symbol]) cache.history[symbol] = {};
    const cachedEntry = cache.history[symbol][days];

    if (isFresh(cachedEntry, HISTORY_TTL_MS)) {
      return res.json({ symbol, points: cachedEntry.data });
    }

    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;
    const response = await fetch(url);
    const data = await response.json();

    const prices = (data.prices || []).map(([ts, price]) => ({
      time: ts,
      price
    }));

    cache.history[symbol][days] = { data: prices, ts: Date.now() };

    res.json({ symbol, points: prices });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Unable to load price history" });
  }
});

// Fallback: send index.html for any unknown route (SPA-style)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Zenzoro backend running on port ${PORT}`);
});
