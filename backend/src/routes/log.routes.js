// C:\AI-Exam-System\backend\src\routes\log.routes.js
import express from "express";

import Log from "../models/log.model.js";

import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  adminMiddleware,
  async (req, res) => {
    try {
      const logs = await Log.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return res.json(logs);
    } catch (error) {
      console.error("Get logs error:", error);

      return res.status(500).json({
        message: "Failed to fetch logs",
      });
    }
  }
);

export default router;