import axios from "axios";

export async function fetchPrice(symbol) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`;
  const response = await axios.get(url);
  return response.data[symbol].usd;
}
