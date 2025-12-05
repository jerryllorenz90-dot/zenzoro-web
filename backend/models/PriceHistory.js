import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema({
  btc: Number,
  eth: Number,
  sol: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("PriceHistory", PriceHistorySchema);