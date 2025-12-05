import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import statusRoutes from "./routes/statusRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Root route so Railway doesn't show "Cannot GET /"
app.get("/", (req, res) => {
  res.send(`
    <h1>Zenzoro Backend Running 🚀</h1>
    <p>Available Routes:</p>
    <ul>
      <li>/api/status</li>
      <li>/api/prices</li>
      <li>/api/history</li>
    </ul>
  `);
});

// API Routes
app.use("/api/status", statusRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/history", historyRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});