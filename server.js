import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean).length ? (process.env.ALLOWED_ORIGINS || "").split(",") : "*"
}));
app.use(express.json());
app.use(morgan("combined"));

// Health check
app.get("/api/status", (req, res) => {
  res.json({ status: "online", service: "ZENZORO backend active" });
});

// Simple price endpoint (uses fake data or COIN_API_URL if provided)
app.get("/api/price", async (req, res) => {
  try {
    const useFake = (process.env.USE_FAKE_DATA || "true") === "true";
    if (useFake) {
      return res.json({ symbol: "BTC", price: 92750, source: "fake" });
    }
    const apiUrl = process.env.COIN_API_URL || "https://api.coindesk.com/v1/bpi/currentprice.json";
    const fetch = (await import('node-fetch')).default;
    const r = await fetch(apiUrl);
    const j = await r.json();
    // Try common response shapes
    let price = null;
    if (j && j.bpi && j.bpi.USD && j.bpi.USD.rate_float) price = j.bpi.USD.rate_float;
    if (!price && j && j.market_data && j.market_data.current_price && j.market_data.current_price.usd) price = j.market_data.current_price.usd;
    if (!price && j && j.price) price = j.price;
    if (!price) price = 0;
    return res.json({ symbol: "BTC", price, source: apiUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "price_fetch_failed" });
  }
});

// Serve a simple readiness endpoint
app.get("/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`ZENZORO backend listening on port ${port}`);
});
