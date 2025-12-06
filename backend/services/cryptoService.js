// backend/services/cryptoService.js
const axios = require('axios');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const ID_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  DOGE: 'dogecoin'
};

function mapRangeToDays(range) {
  switch (range) {
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '7d':
    default:
      return 7;
  }
}

// Market overview for BTC, ETH, SOL, BNB, DOGE
async function fetchMarketOverview() {
  const ids = Object.values(ID_MAP).join(',');
  const url = `${COINGECKO_BASE}/coins/markets`;

  const { data } = await axios.get(url, {
    params: {
      vs_currency: 'usd',
      ids,
      sparkline: false,
      price_change_percentage: '24h'
    },
    timeout: 10000
  });

  return data.map((c) => ({
    symbol: (c.symbol || '').toUpperCase(),
    name: c.name,
    price: c.current_price,
    change24h: c.price_change_percentage_24h,
    marketCap: c.market_cap,
    volume24h: c.total_volume
  }));
}

// History for a given symbol
async function fetchHistory(symbolInput, range) {
  const symbol = (symbolInput || '').toUpperCase();
  const id = ID_MAP[symbol];

  if (!id) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }

  const days = mapRangeToDays(range);
  const url = `${COINGECKO_BASE}/coins/${id}/market_chart`;

  const { data } = await axios.get(url, {
    params: {
      vs_currency: 'usd',
      days
    },
    timeout: 10000
  });

  // data.prices is [timestamp, price]
  return data.prices.map(([time, price]) => ({
    time,
    price
  }));
}

module.exports = {
  fetchMarketOverview,
  fetchHistory
};