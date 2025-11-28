import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "Server is running!",
    time: new Date().toISOString()
  });
});

export default router;
