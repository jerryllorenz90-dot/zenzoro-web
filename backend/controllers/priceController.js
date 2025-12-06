const priceService = require("../services/priceService");

exports.getPrice = async (req, res) => {
  try {
    const data = await priceService.fetchPrice(req.query.coin);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
};