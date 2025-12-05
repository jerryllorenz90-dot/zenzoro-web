const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./backend/db");

// Route imports
const statusRoute = require("./backend/routes/status");
const pricesRoute = require("./backend/routes/prices");
const historyRoute = require("./backend/routes/history");

// App setup
const app = express();
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/status", statusRoute);
app.use("/api/prices", pricesRoute);
app.use("/api/history", historyRoute);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
