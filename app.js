// --- UI ELEMENTS ---
const output = document.getElementById("output");

// --- BACKEND BASE URL ---
const API = "https://zenzoro.online/api";

// --- CHECK SERVER STATUS ---
document.getElementById("check-status").addEventListener("click", async () => {
  output.textContent = "Checking server...";
  try {
    const res = await fetch(`${API}/status`);
    const json = await res.json();
    output.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    output.textContent = "Error: " + error.message;
  }
});

// --- GET PRICE FOR SELECTED COIN ---
document.getElementById("get-coin").addEventListener("click", async () => {
  const coin = document.getElementById("coin-select").value;
  output.textContent = "Loading price...";

  try {
    let endpoint = coin === "btc" ? "/price/btc" : "/prices";
    const res = await fetch(`${API}${endpoint}`);
    const json = await res.json();

    if (coin === "btc") {
      output.textContent = `BTC: $${json.btc}`;
    } else {
      output.textContent = `${coin.toUpperCase()}: $${json[coin.toUpperCase()]}`;
    }
  } catch (error) {
    output.textContent = "Error: " + error.message;
  }
});
