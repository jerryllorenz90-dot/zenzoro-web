export const getStatus = (req, res) => {
  res.json({
    status: "ok",
    service: "Zenzoro Backend",
    time: new Date().toISOString(),
  });
};