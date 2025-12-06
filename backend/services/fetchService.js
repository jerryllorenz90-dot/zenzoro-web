const api = require("../utils/apiClient");

exports.fetchData = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};