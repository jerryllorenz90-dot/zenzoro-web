// Zenzoro frontend: dashboard logic

const API = "/api"; // same origin backend

const statusBox = document.getElementById("server-status");
const priceCardsContainer = document.getElementById("price-cards");
const refreshAllBtn = document.getElementById("refresh-all");
const checkStatusBtn = document.getElementById("check-status");
const loadHistoryBtn = document.getElementById("load-history");
const coinSelect = document.getElementById("coin-select");
const chartTitle = document.getElementById("chart-title");
const chartSubtitle = document.getElementById("chart-subtitle");

let priceChart = null;

function formatUSD(value) {
  if (value === null || value === undefined) return "—";
  return "$" + Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2
  });
}

async function loadStatus() {
  statusBox.textContent = "Checking server...";
  try {
    const res = await fetch(`${API}/status`);
    const json = await res.json();
    statusBox.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    statusBox.textContent = "Error: " + err.message;
  }
}

async function loadPrices() {
  priceCardsContainer.innerHTML = "<p>Loading prices...</p>";
  try {
    const res = await fetch(`${API}/prices`);
    const data = await res.json();

    const entries = Object.entries(data);
    priceCardsContainer.innerHTML = "";

    entries.forEach(([symbol, value]) => {
      const card = document.createElement("div");
      card.className = "mini-card";
      card.innerHTML = `
        <div class="coin-symbol">${symbol}</div>
        <div class="coin-price">${formatUSD(value)}</div>
      `;
      priceCardsContainer.appendChild(card);
    });
  } catch (err) {
    priceCardsContainer.innerHTML = `<p>Error loading prices: ${err.message}</p>`;
  }
}

async function loadHistory() {
  const symbol = coinSelect.value;
  chartTitle.textContent = symbol.toUpperCase() + " – 7 Day History";
  chartSubtitle.textContent = "Fetching data...";

  try {
    const res = await fetch(`${API}/history/${symbol}`);
    const data = await res.json();

    if (!data.points || data.points.length === 0) {
      chartSubtitle.textContent = "No history data available.";
      return;
    }

    const labels = data.points.map((p) => {
      const d = new Date(p.time);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
    });

    const prices = data.points.map((p) => p.price);

    chartSubtitle.textContent = "Last 7 days (hourly)";

    if (priceChart) {
      priceChart.data.labels = labels;
      priceChart.data.datasets[0].data = prices;
      priceChart.data.datasets[0].label = symbol.toUpperCase();
      priceChart.update();
    } else {
      const ctx = document.getElementById("priceChart").getContext("2d");
      priceChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: symbol.toUpperCase(),
              data: prices,
              borderWidth: 2,
              fill: false,
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { maxTicksLimit: 8, color: "#aaa" },
              grid: { display: false }
            },
            y: {
              ticks: { color: "#aaa" },
              grid: { color: "#2a2146" }
            }
          },
          plugins: {
            legend: {
              labels: { color: "#fff" }
            }
          }
        }
      });
    }
  } catch (err) {
    chartSubtitle.textContent = "Error loading history: " + err.message;
  }
}

// Events
checkStatusBtn.addEventListener("click", loadStatus);
refreshAllBtn.addEventListener("click", loadPrices);
loadHistoryBtn.addEventListener("click", loadHistory);

// Initial load
loadPrices();
loadHistory();
