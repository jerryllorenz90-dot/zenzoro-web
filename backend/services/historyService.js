const api = require("../utils/apiClient");

exports.fetchHistory = async (coin = "bitcoin", days = 7) => {
  const response = await api.get(`/coins/${coin}/market_chart?vs_currency=usd&days=${days}`);
  return response.data;
};