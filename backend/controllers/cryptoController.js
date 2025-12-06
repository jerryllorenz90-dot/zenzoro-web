// backend/controllers/cryptoController.js
const {
  fetchMarketOverview,
  fetchHistory
} = require('../services/cryptoService');

// GET /api/status
async function getStatus(req, res) {
  res.json({
    status: 'ok',
    service: 'Zenzoro Backend',
    time: new Date().toISOString()
  });
}

// GET /api/market
async function getMarketOverview(req, res) {
  try {
    const data = await fetchMarketOverview();
    res.json({ coins: data });
  } catch (err) {
    console.error('Market overview error:', err.message);
    res.status(500).json({ error: 'Failed to load market data.' });
  }
}

// GET /api/history/:symbol?range=7d
async function getHistory(req, res) {
  const { symbol } = req.params;
  const range = req.query.range || '7d';

  try {
    const prices = await fetchHistory(symbol, range);
    res.json({ prices });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Failed to load history data.' });
  }
}

module.exports = {
  getStatus,
  getMarketOverview,
  getHistory
};