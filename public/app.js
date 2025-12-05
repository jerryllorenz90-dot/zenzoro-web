// Base API URL – backend lives on same domain
const API_BASE = "";

// Small helper
function $(id) {
  return document.getElementById(id);
}

let historyChart = null;

/** Format number with compact notation */
function formatNumber(num) {
  if (num === null || num === undefined) return "–";
  try {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(num);
  } catch {
    return String(num);
  }
}

/** Format price with 2–4 decimals */
function formatPrice(value) {
  if (value === null || value === undefined || isNaN(value)) return "–";
  const n = Number(value);
  const decimals = n >= 100 ? 2 : 4;
  return "$" + n.toFixed(decimals);
}

/** Load backend status */
async function loadStatus() {
  const target = $("status-json");
  const dot = $("status-indicator");
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    target.textContent = JSON.stringify(json, null, 2);
    dot.classList.remove("dot-offline");
    dot.classList.add("dot-online");
  } catch (err) {
    target.textContent = `Error loading status: ${err.message}`;
    dot.classList.remove("dot-online");
    dot.classList.add("dot-offline");
  }
}

/** Load market overview */
async function loadMarket(selectedSymbol = "BTC") {
  const errorEl = $("market-error");
  const grid = $("market-cards");
  const updatedEl = $("market-updated");

  errorEl.classList.add("hidden");
  errorEl.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/api/market`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const coins = data.coins || data || [];
    if (!Array.isArray(coins) || coins.length === 0) {
      throw new Error("No market data available");
    }

    // Build cards
    grid.innerHTML = "";
    coins.forEach((coin) => {
      const change = Number(coin.change24h || coin.change || 0);
      const isPos = change >= 0;
      const card = document.createElement("div");
      card.className = "market-card";

      card.innerHTML = `
        <div class="market-symbol">${coin.symbol || ""}</div>
        <div class="market-name">${coin.name || ""}</div>
        <div class="market-price">${formatPrice(coin.price)}</div>
        <div class="market-change ${isPos ? "pos" : "neg"}">
          ${isPos ? "▲" : "▼"} ${change.toFixed(2)}% (24h)
        </div>
        <div class="market-meta">
          Mkt Cap: ${formatNumber(coin.marketCap)} • Vol 24h: ${formatNumber(
        coin.volume24h
      )}
        </div>
      `;

      grid.appendChild(card);
    });

    const updated =
      data.updatedAt || (coins[0] && coins[0].updatedAt) || new Date().toISOString();
    updatedEl.textContent = `Last updated: ${new Date(updated).toLocaleString()}`;
  } catch (err) {
    grid.innerHTML = "";
    errorEl.textContent = `Failed to load market data: ${err.message}`;
    errorEl.classList.remove("hidden");
    updatedEl.textContent = "";
  }

  // Highlight selected chip
  const chips = document.querySelectorAll("#coin-filter .chip");
  chips.forEach((chip) => {
    if (chip.dataset.symbol === selectedSymbol) {
      chip.classList.add("chip-active");
    } else {
      chip.classList.remove("chip-active");
    }
  });
}

/** Load history and update chart */
async function loadHistory(symbol = "bitcoin", range = "7d") {
  const errorEl = $("history-error");
  const updatedEl = $("history-updated");

  errorEl.classList.add("hidden");
  errorEl.textContent = "";
  updatedEl.textContent = "";

  try {
    const res = await fetch(
      `${API_BASE}/api/history/${encodeURIComponent(symbol)}?range=${encodeURIComponent(
        range
      )}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Accept either { points:[{time,price},…] } or plain array
    const points = data.points || data || [];
    if (!Array.isArray(points) || points.length === 0) {
      throw new Error("No history data available");
    }

    const labels = points.map((p) => p.time || p.date || "");
    const values = points.map((p) => Number(p.price || p.value || 0));

    const ctx = document.getElementById("history-chart").getContext("2d");

    if (!historyChart) {
      historyChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Price",
              data: values,
              fill: true,
              tension: 0.35
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: "#8e97c6", maxTicksLimit: 7 },
              grid: { color: "rgba(255,255,255,0.04)" }
            },
            y: {
              ticks: {
                color: "#8e97c6",
                callback: (v) => "$" + v.toLocaleString()
              },
              grid: { color: "rgba(255,255,255,0.04)" }
            }
          },
          elements: {
            point: { radius: 0 }
          }
        }
      });
    } else {
      historyChart.data.labels = labels;
      historyChart.data.datasets[0].data = values;
      historyChart.update();
    }

    const updated =
      data.updatedAt || (points[points.length - 1] && points[points.length - 1].time);
    if (updated) {
      updatedEl.textContent = `Last price at: ${new Date(updated).toLocaleString()}`;
    }
  } catch (err) {
    if (historyChart) {
      historyChart.destroy();
      historyChart = null;
    }
    errorEl.textContent = `Failed to load chart data: ${err.message}`;
    errorEl.classList.remove("hidden");
  }
}

/** Wire up events & initial load */
document.addEventListener("DOMContentLoaded", () => {
  // Initial loads
  loadStatus();
  loadMarket("BTC");
  loadHistory("bitcoin", "7d");

  // Refresh button
  $("refresh-all").addEventListener("click", () => {
    const currentSymbolChip = document.querySelector("#coin-filter .chip-active");
    const symbolChip = currentSymbolChip
      ? currentSymbolChip.dataset.symbol
      : "BTC";
    const historySymbol = $("history-symbol").value;
    const historyRange = $("history-range").value;

    loadStatus();
    loadMarket(symbolChip);
    loadHistory(historySymbol, historyRange);
  });

  // Market chip clicks
  document.getElementById("coin-filter").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const symbol = btn.dataset.symbol || "BTC";
    loadMarket(symbol);
  });

  // History selectors
  $("history-symbol").addEventListener("change", () => {
    loadHistory($("history-symbol").value, $("history-range").value);
  });

  $("history-range").addEventListener("change", () => {
    loadHistory($("history-symbol").value, $("history-range").value);
  });
});