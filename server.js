// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGODB_URI, { dbName: "zenzoro", useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  portfolio: {
    btc: { type: Number, default: 0 },
    eth: { type: Number, default: 0 },
    sol: { type: Number, default: 0 },
    bnb: { type: Number, default: 0 },
    doge: { type: Number, default: 0 }
  }
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/status", (req, res) => {
  res.json({ status: "ok", service: "Zenzoro backend" });
});

// Register route
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.json({ error: "User already exists" });

    const newUser = new User({ email, password });
    await newUser.save();

    res.json({ success: true, message: "Account created" });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Login route
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.password !== password)
    return res.json({ error: "Invalid email or password" });

  res.json({
    success: true,
    message: "Login successful",
    portfolio: user.portfolio
  });
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
