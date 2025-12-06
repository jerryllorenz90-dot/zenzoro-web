const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// API ROUTES
app.use("/api/crypto", require("./routes/cryptoRoutes"));

// SERVE FRONTEND (Correct final working path)
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Status endpoint
app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    service: "Zenzoro Backend",
    time: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});