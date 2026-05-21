// C:\AI-Exam-System\backend\src\routes\verifyRoutes.js
import express from "express";
import { verifyResult } from "../controllers/verifyController.js";

const router = express.Router();
router.get("/:id", verifyResult);

export default router;