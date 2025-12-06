// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./db");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve frontend from ../public
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// Root -> send dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Simple backend health check
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    service: "Zenzoro Backend",
    time: new Date().toISOString(),
  });
});

// API routes
const priceRoutes = require("./routes/priceRoutes");
const historyRoutes = require("./routes/historyRoutes");
const fetchRoutes = require("./routes/fetchRoutes");

// Example:
//   GET /api/prices?coin=bitcoin
//   GET /api/history?coin=bitcoin&days=7
app.use("/api/prices", priceRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/fetch", fetchRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});