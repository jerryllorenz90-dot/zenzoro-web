// Base URL – relative since frontend is served by the same domain
const API_BASE = "";

// Demo portfolio (you can change these numbers)
const PORTFOLIO = {
  BTC: 0.4,
  ETH: 2.3,
  SOL: 10.5,
};

let latestPrices = null;
let historyChart = null;

/* -------------- Auth: simple demo login -------------- */

const loginForm = document.getElementById("login-form");
const loginNameInput = document.getElementById("login-name");
const loginPasswordInput = document.getElementById("login-password");
const authSection = document.getElementById("auth-section");
const profileSection = document.getElementById("profile-section");
const profileName = document.getElementById("profile-name");
const avatarLetter = document.getElementById("avatar-letter");
const logoutBtn = document.getElementById("logout-btn");
const portfolioValueEl = document.getElementById("portfolio-value");
const portfolioChangeEl = document.getElementById("portfolio-change");

function setLoggedIn(name) {
  localStorage.setItem("zenzoroUser", name);
  profileName.textContent = name;
  avatarLetter.textContent = name.trim()[0]?.toUpperCase() || "U";
  authSection.classList.add("hidden");
  profileSection.classList.remove("hidden");
}

function setLoggedOut() {
  localStorage.removeItem("zenzoroUser");
  authSection.classList.remove("hidden");
  profileSection.classList.add("hidden");
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = loginNameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!name || !password) return;

  // Demo only – in real app you would call an auth endpoint
  setLoggedIn(name);
  loginPasswordInput.value = "";
});

logoutBtn.addEventListener("click", () => {
  setLoggedOut();
});

const savedUser = localStorage.getItem("zenzoroUser");
if (savedUser) {
  setLoggedIn(savedUser);
}

/* -------------- Backend status -------------- */

const statusOutput = document.getElementById("status-output");
const refreshStatusBtn = document.getElementById("refresh-status");

async function fetchStatus() {
  statusOutput.textContent = "Checking...";
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    const json = await res.json();
    statusOutput.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    statusOutput.textContent = "Error loading status: " + err.message;
  }
}

refreshStatusBtn.addEventListener("click", fetchStatus);

/* -------------- Prices + Market overview -------------- */

const refreshPricesBtn = document.getElementById("refresh-prices");
const marketGrid = document.getElementById("market-grid");
const portfolioTableBody = document.getElementById("portfolio-table-body");

function formatUSD(value) {
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

async function fetchPrices() {
  try {
    refreshPricesBtn.disabled = true;
    refreshPricesBtn.textContent = "Refreshing...";
    const res = await fetch(`${API_BASE}/api/prices`);
    const json = await res.json();
    latestPrices = json;
    renderMarketCards();
    renderPortfolioTable();
    refreshPricesBtn.textContent = "Refresh prices";
  } catch (err) {
    console.error("Error fetching prices", err);
    refreshPricesBtn.textContent = "Failed – retry";
  } finally {
    refreshPricesBtn.disabled = false;
  }
}

function renderMarketCards() {
  if (!latestPrices) return;

  const mapping = {
    BTC: { name: "Bitcoin" },
    ETH: { name: "Ethereum" },
    SOL: { name: "Solana" },
  };

  marketGrid.innerHTML = "";

  Object.entries(mapping).forEach(([symbol, meta]) => {
    const price = latestPrices[symbol.toLowerCase()];
    const card = document.createElement("div");
    card.className = "asset-card";
    card.innerHTML = `
      <div class="asset-header">
        <span class="asset-symbol">${symbol}</span>
        <span class="asset-symbol">${new Date(
          latestPrices.timestamp || new Date()
        ).toLocaleTimeString()}</span>
      </div>
      <div class="asset-name">${meta.name}</div>
      <div class="asset-price">${formatUSD(price)}</div>
      <div class="asset-cap">Demo 24h change &amp; market cap coming soon</div>
    `;
    marketGrid.appendChild(card);
  });
}

function renderPortfolioTable() {
  if (!latestPrices) return;

  portfolioTableBody.innerHTML = "";

  let total = 0;
  Object.entries(PORTFOLIO).forEach(([symbol, amount]) => {
    const price = latestPrices[symbol.toLowerCase()];
    const value = price * amount;
    total += value;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${symbol}</td>
      <td>${amount}</td>
      <td>${formatUSD(price)}</td>
      <td>${formatUSD(value)}</td>
    `;
    portfolioTableBody.appendChild(row);
  });

  portfolioValueEl.textContent = formatUSD(total);
  portfolioChangeEl.textContent = "+0.00% (demo)";
}

/* -------------- History chart -------------- */

const historyHint = document.getElementById("history-hint");
const historyCanvas = document.getElementById("history-chart");

/**
 * Fetch history from backend. If backend has no history yet,
 * we generate a smooth fake 7-day curve starting from current price.
 */
async function fetchHistory() {
  historyHint.textContent = "Loading chart...";
  try {
    const res = await fetch(`${API_BASE}/api/history`);
    let json = await res.json();

    if (!Array.isArray(json) || json.length === 0) {
      json = generateMockHistory();
      historyHint.textContent =
        "Showing generated data – real history will appear once backend stores it.";
    } else {
      historyHint.textContent = "Live history from backend.";
    }

    const labels = json
      .slice()
      .reverse()
      .map((p) =>
        new Date(p.timestamp || p.time || new Date()).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        )
      );
    const prices = json
      .slice()
      .reverse()
      .map((p) => p.btc || p.price || 0);

    renderHistoryChart(labels, prices);
  } catch (err) {
    console.error("Error fetching history", err);
    historyHint.textContent = "Failed to load history – showing demo data.";
    const mock = generateMockHistory();
    const labels = mock.map((p) => p.label);
    const prices = mock.map((p) => p.price);
    renderHistoryChart(labels, prices);
  }
}

function generateMockHistory() {
  const base =
    latestPrices?.btc ||
    latestPrices?.bitcoin ||
    90000; // fallback if price not loaded yet
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const variance = (Math.sin(i / 2) * 0.03 + Math.random() * 0.01) * base;
    const price = base * (1 + (Math.random() > 0.5 ? 1 : -1) * 0.02) + variance;
    data.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price,
    });
  }
  return data;
}

function renderHistoryChart(labels, prices) {
  if (historyChart) {
    historyChart.destroy();
  }

  historyChart = new Chart(historyCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "BTC price (USD)",
          data: prices,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            callback: (value) => "$" + value.toLocaleString("en-US"),
          },
        },
      },
    },
  });
}

/* -------------- Init -------------- */

async function init() {
  fetchStatus();
  await fetchPrices();
  await fetchHistory();

  // Auto-refresh prices every 60s
  setInterval(fetchPrices, 60000);
}

refreshPricesBtn.addEventListener("click", fetchPrices);

document.addEventListener("DOMContentLoaded", init);