import express from "express";
import Log from "../models/log.model.js";

const router = express.Router();

// GET all logs
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

export default router;