// C:\AI-Exam-System\backend\src\routes\adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import Submission from "../models/Submission.js";
import SecurityEvent from "../models/SecurityEvent.js";

import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { logEvent } from "../utils/logger.js";

const router = express.Router();

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const validObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/stats", protect, adminMiddleware, async (req, res) => {
  try {
    const [
      totalStudents,
      totalExaminers,
      totalExams,
      totalResults,
      totalSubmissions,
      totalSecurityEvents,
      questionCountAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "examiner" }),
      Exam.countDocuments(),
      Result.countDocuments(),
      Submission.countDocuments(),
      SecurityEvent.countDocuments(),
      Exam.aggregate([
        {
          $project: {
            questionCount: { $size: { $ifNull: ["$questions", []] } },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$questionCount" },
          },
        },
      ]),
    ]);

    const totalQuestions = questionCountAgg[0]?.total || 0;

    return res.json({
      totalStudents,
      totalExaminers,
      totalExams,
      totalResults,
      totalSubmissions,
      totalSecurityEvents,
      totalQuestions,
      blockchainLogs: "Verified",
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin statistics",
    });
  }
});

router.get("/users", protect, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "-password -googleId -lastLoginIP -security.lastLoginIP -security.lastUserAgent",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json(users);
  } catch (error) {
    console.error("Admin users error:", error);

    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

router.post("/users", protect, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = normalizeEmail(email);

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (!["student", "examiner"].includes(role)) {
      return res.status(400).json({
        message: "Only student or examiner accounts can be created here",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role,
      authProvider: "local",
      isEmailVerified: false,
      isActive: true,
    });

    await logEvent({
      type: "admin",
      action: "ADMIN_CREATE_USER",
      message: `Admin created ${role} account`,
      user: req.user.id,
      meta: {
        createdUserId: user._id,
        role,
      },
      status: "success",
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin create user error:", error);

    return res.status(500).json({
      message: "Failed to create user",
    });
  }
});

router.patch(
  "/users/:userId/role",
  protect,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!validObjectId(userId)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (!["student", "examiner", "admin"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      if (userId === req.user.id && role !== "admin") {
        return res.status(400).json({
          message: "You cannot remove your own admin role",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        {
          new: true,
          runValidators: true,
        },
      ).select("-password -googleId");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      await logEvent({
        type: "admin",
        action: "USER_ROLE_UPDATED",
        message: "User role updated",
        user: req.user.id,
        meta: {
          targetUserId: user._id,
          newRole: role,
        },
        status: "success",
      });

      return res.json({
        message: "Role updated successfully",
        user,
      });
    } catch (error) {
      console.error("Update role error:", error);

      return res.status(500).json({
        message: "Failed to update role",
      });
    }
  },
);

router.delete("/users/:userId", protect, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    await logEvent({
      type: "admin",
      action: "USER_DELETED",
      message: "User deleted by administrator",
      user: req.user.id,
      meta: {
        deletedUserId: userId,
        deletedRole: user.role,
      },
      status: "warning",
    });

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Failed to delete user",
    });
  }
});

router.post("/assign-examiner", protect, adminMiddleware, async (req, res) => {
  try {
    const { examId, examinerId } = req.body;

    if (!validObjectId(examId) || !validObjectId(examinerId)) {
      return res.status(400).json({
        message: "Invalid exam ID or examiner ID",
      });
    }

    const examiner = await User.findOne({
      _id: examinerId,
      role: "examiner",
      isActive: true,
    });

    if (!examiner) {
      return res.status(400).json({
        message: "Invalid or inactive examiner",
      });
    }

    const exam = await Exam.findByIdAndUpdate(
      examId,
      {
        assignedExaminer: examinerId,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("assignedExaminer", "name email role");

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    await logEvent({
      type: "admin",
      action: "EXAMINER_ASSIGNED",
      message: "Examiner assigned to examination",
      user: req.user.id,
      exam: exam._id,
      meta: {
        examinerId,
      },
      status: "success",
    });

    return res.json({
      message: "Examiner assigned successfully",
      exam,
    });
  } catch (error) {
    console.error("Assign examiner error:", error);

    return res.status(500).json({
      message: "Failed to assign examiner",
    });
  }
});

export default router;
