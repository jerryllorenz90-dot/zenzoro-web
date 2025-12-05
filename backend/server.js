// ------------------------------
// Zenzoro Backend Server
// ------------------------------

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------
// Environment variables
// ---------------------------------------
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// ---------------------------------------
// Express setup
// ---------------------------------------
const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------------------
// MongoDB Connection
// ---------------------------------------
async function connectDB() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Set it in Railway Variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
}

connectDB();

// ---------------------------------------
// API ROUTES
// ---------------------------------------

// Status Check
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    service: "Zenzoro backend",
    time: new Date().toISOString(),
  });
});

// Market Route (dummy example — replace with real logic)
app.get("/api/market", async (req, res) => {
  try {
    // TODO: Replace with real crypto service logic
    res.json([
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        price: 43200,
        change24h: -0.4,
        marketCap: 850_000_000_000,
        volume24h: 18_000_000_000,
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        price: 2280,
        change24h: +1.3,
        marketCap: 280_000_000_000,
        volume24h: 9_000_000_000,
      },
    ]);
  } catch (error) {
    console.error("Market error:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

// Price History (dummy — replace with real logic)
app.get("/api/history/:coin", async (req, res) => {
  const { coin } = req.params;

  try {
    // TODO: Replace with CoinGecko history integration
    res.json({
      prices: [
        [Date.now() - 6 * 86400000, 42000],
        [Date.now() - 5 * 86400000, 42200],
        [Date.now() - 4 * 86400000, 42500],
        [Date.now() - 3 * 86400000, 43000],
        [Date.now() - 2 * 86400000, 43500],
        [Date.now() - 1 * 86400000, 43200],
        [Date.now(), 43350],
      ],
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history data" });
  }
});

// ---------------------------------------
// STATIC FRONTEND (React in /public)
// ---------------------------------------
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// SPA fallback — serve React app for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

// ---------------------------------------
// Start Server
// ---------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});