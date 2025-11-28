// app.js - frontend logic for Zenzoro dashboard

const API_BASE = ""; 
// keep empty: frontend + backend from same origin → use relative URLs

const statusBtn = document.getElementById("check-status-btn");
const priceBtn = document.getElementById("get-price-btn");
const statusBox = document.getElementById("status-box");
const priceBox = document.getElementById("price-box");
const yearSpan = document.getElementById("year");

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

function getUrl(path) {
  return `${API_BASE || ""}${path}`;
}

statusBtn.addEventListener("click", async () => {
  statusBox.textContent = "Loading server status...";
  try {
    const res = await fetch(getUrl("/api/status"));
    const data = await res.json();
    statusBox.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    statusBox.textContent = "Error contacting server.";
  }
});

priceBtn.addEventListener("click", async () => {
  priceBox.textContent = "Loading BTC price...";
  try {
    const res = await fetch(getUrl("/api/price"));
    const data = await res.json();
    priceBox.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    priceBox.textContent = "Error fetching price.";
  }
});
