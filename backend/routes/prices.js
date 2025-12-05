const express = require("express");
const router = express.Router();
const { getPrices } = require("../services/cryptoService");

router.get("/", async (req, res) => {
  const data = await getPrices();
  if (!data) return res.status(500).json({ error: "Failed to load prices" });
  res.json(data);
});

module.exports = router;