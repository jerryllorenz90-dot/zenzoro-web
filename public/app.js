const API = "https://zenzoro.online/api";
let currentSymbol = "BTC";

function setSymbol(sym) {
  currentSymbol = sym;
  loadPrices();
}

async function checkStatus() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    document.getElementById("statusOutput").textContent =
      JSON.stringify(data, null, 2);
    
    document.getElementById("backend-status").textContent = "Online";
    document.getElementById("backend-status").style.background = "#00c853";
  } catch (err) {
    document.getElementById("backend-status").textContent = "Offline";
    document.getElementById("backend-status").style.background = "#ff1744";
  }
}

async function loadPrices() {
  try {
    const res = await fetch(`${API}/crypto/prices/${currentSymbol}`);
    const data = await res.json();
    document.getElementById("priceOutput").textContent =
      JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
  }
}

async function loadHistory() {
  const symbol = document.getElementById("historySymbol").value;
  const days = document.getElementById("historyRange").value;

  try {
    const res = await fetch(`${API}/crypto/history/${symbol}/${days}`);
    const data = await res.json();
    document.getElementById("historyOutput").textContent =
      JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
  }
}

checkStatus();
loadPrices();