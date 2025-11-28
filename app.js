// SELECT UI ELEMENTS
const statusBox = document.getElementById("server-status");
const priceBox  = document.getElementById("btc-price");

// BACKEND API BASE URL
const API = "https://zenzoro.online/api";

// SERVER STATUS CHECK
document.getElementById("check-status").addEventListener("click", async () => {
  statusBox.textContent = "Checking server...";
  try {
    const res = await fetch(`${API}/status`);
    const json = await res.json();
    statusBox.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    statusBox.textContent = "Error: " + error.message;
  }
});

// GET BTC PRICE
document.getElementById("get-btc").addEventListener("click", async () => {
  priceBox.textContent = "Loading BTC price...";
  try {
    const res = await fetch(`${API}/price/btc`);
    const json = await res.json();
    priceBox.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    priceBox.textContent = "Error: " + error.message;
  }
});
