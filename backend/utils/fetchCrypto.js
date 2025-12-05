import axios from "axios";

const fetchCrypto = async () => {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd";

  const response = await axios.get(url);

  return {
    btc: response.data.bitcoin.usd,
    eth: response.data.ethereum.usd,
    sol: response.data.solana.usd,
    timestamp: new Date().toISOString(),
  };
};

export default fetchCrypto;