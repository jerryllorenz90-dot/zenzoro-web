const API = "https://zenzoro.online/api";

/* SERVER CHECK */
async function checkStatus() {
    try {
        const res = await fetch(`${API}/status`);
        const data = await res.json();
        document.getElementById("statusResult").textContent =
            JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById("statusResult").textContent = "Error: " + err;
    }
}

/* PRICES */
async function loadPrice(symbol) {
    try {
        const res = await fetch(`${API}/prices/${symbol}`);
        const data = await res.json();
        document.getElementById("priceResult").textContent =
            JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById("priceResult").textContent = "Error: " + err;
    }
}

/* HISTORY */
async function loadHistory() {
    const symbol = document.getElementById("symbol").value;
    const range = document.getElementById("range").value;

    try {
        const res = await fetch(`${API}/history/${symbol}/${range}`);
        const data = await res.json();
        document.getElementById("historyResult").textContent =
            JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById("historyResult").textContent = "Error: " + err;
    }
}