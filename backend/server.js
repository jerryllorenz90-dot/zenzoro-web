const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Serve static frontend from ../public
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// Root → send index.html (frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Health check for backend
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

app.use("/api/prices", priceRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/fetch", fetchRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));