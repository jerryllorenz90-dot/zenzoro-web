import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import statusRoutes from "./routes/statusRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API routes
app.use("/api/status", statusRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/history", historyRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});