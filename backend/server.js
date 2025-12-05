import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// ----- MongoDB Connection -----
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
}
connectDB();

// ----- ROOT ROUTE (Fixes Cannot GET /) -----
app.get("/", (req, res) => {
  res.send(`
      <h1 style="font-family:Arial;text-align:center;margin-top:50px;">
        🚀 Zenzoro Backend Running
      </h1>
      <p style="text-align:center;font-size:18px;">
        Available endpoints:
      </p>
      <ul style="text-align:center;list-style:none;font-size:18px;">
        <li>GET /api/status</li>
        <li>GET /api/prices</li>
        <li>GET /api/history</li>
      </ul>
  `);
});

// ----- /api/status -----
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    service: "Zenzoro backend",
    time: new Date().toISOString()
  });
});

// ----- /api/prices -----
app.get("/api/prices", async (req, res) => {
  try {
    // Example payload - replace later with real DB logic
    res.json({
      btc: 98765,
      eth: 5432,
      sol: 123
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// ----- /api/history -----
app.get("/api/history", async (req, res) => {
  try {
    res.json({
      message: "Historical data coming soon.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});