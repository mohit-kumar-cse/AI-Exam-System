//  backend\src\routes\adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* ==========================================
   DASHBOARD STATS
========================================== */
router.get("/stats", protect, adminMiddleware, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalExams = await Exam.countDocuments();

    res.json({
      totalStudents,
      totalExams,
      blockchainLogs: "Verified"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ==========================================
   USER MANAGEMENT
========================================== */

// Get all users
router.get("/users", protect, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
router.post("/users", protect, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!["student", "examiner"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student"
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.patch("/users/:userId/role", protect, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/users/:userId", protect, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   ASSIGN EXAMINER TO EXAM
========================================== */
router.post("/assign-examiner", protect, adminMiddleware, async (req, res) => {
  try {
    const { examId, examinerId } = req.body;

    // Verify examiner exists and has examiner role
    const examiner = await User.findById(examinerId);
    if (!examiner || examiner.role !== "examiner") {
      return res.status(400).json({ message: "Invalid examiner" });
    }

    // Update exam with assigned examiner
    const exam = await Exam.findByIdAndUpdate(
      examId,
      { assignedExaminer: examinerId },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({
      message: "Examiner assigned successfully",
      exam
    });
  } catch (error) {
    console.error("Assign examiner error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   EXAM CREATION (if needed)
========================================== */
router.post("/create-exam", protect, adminMiddleware, (req, res) => {
  res.json({ message: "Exam created successfully ✅" });
});

export default router;