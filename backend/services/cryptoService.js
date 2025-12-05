const axios = require("axios");

const API_URL = "https://api.coingecko.com/api/v3/simple/price";
const HISTORY_URL = "https://api.coingecko.com/api/v3/coins";

async function getPrices() {
  try {
    const response = await axios.get(API_URL, {
      params: {
        ids: "bitcoin,ethereum,solana,binancecoin,dogecoin",
        vs_currencies: "usd",
        include_market_cap: true,
        include_24hr_change: true,
        include_24hr_vol: true
      }
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching prices:", error.message);
    return null;
  }
}

async function getHistory(coinId, days = 7) {
  try {
    const url = `${HISTORY_URL}/${coinId}/market_chart`;
    const response = await axios.get(url, {
      params: { vs_currency: "usd", days }
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching history:", error.message);
    return null;
  }
}

module.exports = { getPrices, getHistory };