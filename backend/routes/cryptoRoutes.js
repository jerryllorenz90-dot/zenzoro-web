// backend/routes/cryptoRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStatus,
  getMarketOverview,
  getHistory
} = require('../controllers/cryptoController');

// Health / status
// GET /api/status
router.get('/status', getStatus);

// Market overview for all tracked coins
// GET /api/market
router.get('/market', getMarketOverview);

// Price history for a single symbol
// GET /api/history/:symbol?range=7d
router.get('/history/:symbol', getHistory);

module.exports = router;