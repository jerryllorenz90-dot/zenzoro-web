// Frontend logic for Zenzoro dashboard

const API_BASE = ""; // same origin
let authToken = localStorage.getItem("zenzoro_token") || null;
let marketsCache = [];

// Elements
const statusBox = document.getElementById("status-box");
const checkStatusBtn = document.getElementById("check-status");
const refreshBtn = document.getElementById("refresh-markets");
const marketGrid = document.getElementById("market-grid");

const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authError = document.getElementById("auth-error");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const authSubmit = document.getElementById("auth-submit");
const userSummary = document.getElementById("user-summary");
const userEmailSpan = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

const portfolioGuest = document.getElementById("portfolio-guest");
const portfolioContent = document.getElementById("portfolio-content");
const portfolioRows = document.getElementById("portfolio-rows");
const portfolioTotal = document.getElementById("portfolio-total");
const portfolioForm = document.getElementById("portfolio-form");
const pfSymbol = document.getElementById("pf-symbol");
const pfAmount = document.getElementById("pf-amount");
const pfAvg = document.getElementById("pf-avg");
const pfMsg = document.getElementById("portfolio-msg");

const chartSymbolSelect = document.getElementById("chart-symbol");
const chartMsg = document.getElementById("chart-msg");
const chartCanvas = document.getElementById("price-chart");
let priceChart = null;

// ===== Helpers =====

function setToken(token, email) {
  authToken = token;
  if (token) {
    localStorage.setItem("zenzoro_token", token);
    userSummary.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    if (email) userEmailSpan.textContent = email;
    portfolioGuest.classList.add("hidden");
    portfolioContent.classList.remove("hidden");
  } else {
    localStorage.removeItem("zenzoro_token");
    userSummary.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    portfolioGuest.classList.remove("hidden");
    portfolioContent.classList.add("hidden");
    userEmailSpan.textContent = "";
  }
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = "Bearer " + authToken;
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: "Request failed" };
    }
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// ===== Status =====
checkStatusBtn.addEventListener("click", async () => {
  statusBox.textContent = "Checking server...";
  try {
    const data = await api("/api/status", { method: "GET" });
    statusBox.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    statusBox.textContent = "Error: " + err.message;
  }
});

// ===== Auth tabs =====
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  authSubmit.textContent = "Login";
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  authSubmit.textContent = "Register";
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if (!email || !password) return;

  const isRegister = tabRegister.classList.contains("active");
  const path = isRegister ? "/api/auth/register" : "/api/auth/login";

  authSubmit.disabled = true;
  authSubmit.textContent = isRegister ? "Creating..." : "Signing in...";

  try {
    const data = await api(path, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token, data.user.email);
    authError.textContent = "";
    authPassword.value = "";
    await loadPortfolio();
  } catch (err) {
    authError.textContent = err.message;
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = tabRegister.classList.contains("active")
      ? "Register"
      : "Login";
  }
});

logoutBtn.addEventListener("click", () => {
  setToken(null);
  portfolioRows.innerHTML = "";
  portfolioTotal.textContent = "";
});

// ===== Markets =====

async function loadMarkets() {
  marketGrid.innerHTML = "";
  try {
    const data = await api("/api/markets");
    marketsCache = data;
    data.forEach((m) => {
      const card = document.createElement("div");
      card.className = "market-card";
      const change = m.change24h || 0;
      const cls = change >= 0 ? "pos" : "neg";
      card.innerHTML = `
        <div class="market-symbol">${m.symbol}</div>
        <div class="market-price">$${m.price.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}</div>
        <div class="market-change ${cls}">
          ${change >= 0 ? "+" : ""}${change.toFixed(2)}% (24h)
        </div>
      `;
      marketGrid.appendChild(card);
    });
  } catch (err) {
    marketGrid.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

refreshBtn.addEventListener("click", loadMarkets);

// ===== Portfolio =====

function getPriceForSymbol(symbol) {
  const item = marketsCache.find((m) => m.symbol === symbol);
  return item ? item.price : null;
}

async function loadPortfolio() {
  if (!authToken) return;
  try {
    const data = await api("/api/portfolio");
    portfolioRows.innerHTML = "";
    let totalValue = 0;
    data.holdings.forEach((h) => {
      const price = getPriceForSymbol(h.symbol) || 0;
      const value = price * Number(h.amount);
      totalValue += value;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${h.symbol}</td>
        <td>${Number(h.amount).toFixed(4)}</td>
        <td>$${Number(h.avg_buy_price).toFixed(2)}</td>
        <td>$${value.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}</td>
      `;
      portfolioRows.appendChild(tr);
    });
    portfolioTotal.textContent =
      "Total value: $" +
      totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch (err) {
    pfMsg.textContent = "Error loading portfolio: " + err.message;
  }
}

portfolioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!authToken) {
    pfMsg.textContent = "You must be logged in.";
    return;
  }
  const symbol = pfSymbol.value;
  const amount = Number(pfAmount.value);
  const avg = Number(pfAvg.value);
  if (!symbol || !amount || !avg) return;

  pfMsg.textContent = "Saving...";
  try {
    await api("/api/portfolio", {
      method: "POST",
      body: JSON.stringify({
        symbol,
        amount,
        avgBuyPrice: avg,
      }),
    });
    pfMsg.textContent = "Saved.";
    await loadPortfolio();
  } catch (err) {
    pfMsg.textContent = "Error: " + err.message;
  }
});

// ===== Charts =====

async function loadChart(symbol) {
  chartMsg.textContent = "Loading history...";
  try {
    const data = await api(`/api/history/${symbol}`);
    const labels = data.history.map((p) =>
      new Date(p.time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    );
    const prices = data.history.map((p) => p.price);

    if (priceChart) priceChart.destroy();

    priceChart = new Chart(chartCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${symbol} price (USD)`,
            data: prices,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 6 },
          },
        },
      },
    });

    chartMsg.textContent = "";
  } catch (err) {
    chartMsg.textContent = "Error loading chart: " + err.message;
  }
}

chartSymbolSelect.addEventListener("change", () =>
  loadChart(chartSymbolSelect.value)
);

// ===== Initial load =====

(async function init() {
  if (authToken) {
    // Try to fetch current user to validate token
    try {
      const data = await api("/api/me");
      setToken(authToken, data.user.email);
    } catch {
      setToken(null);
    }
  }

  loadMarkets();
  loadChart(chartSymbolSelect.value);
})();
