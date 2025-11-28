const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 8080;

// serve frontend
app.use(express.static(path.join(__dirname)));

app.get("/api/status", (req, res) => {
  res.json({ status: "Server is running!" });
});

app.get("/api/price", (req, res) => {
  res.json({ btc: "78000" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
