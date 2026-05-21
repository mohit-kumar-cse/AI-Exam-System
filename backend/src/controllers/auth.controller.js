// backend/src/controllers/auth.controller.js
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logEvent } from "../utils/logger.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ SECURITY FIX: role is NEVER taken from request body
    // Self-registration always creates a student account
    // Admins/examiners must be created by an admin directly in the DB or via admin panel
    const role = "student";

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      await logEvent({
        type: "auth",
        message: "Register failed - email already exists",
        meta: { email },
      });
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    await logEvent({
      type: "auth",
      message: "Student registered",
      user,
    });

    res.status(201).json({
      message: "Account created successfully. Please login.",
    });

  } catch (error) {
    await logEvent({
      type: "error",
      message: "Register error",
      meta: { error: error.message },
    });
    res.status(500).json({ error: error.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log("🔍 Login attempt:", email);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      await logEvent({
        type: "auth",
        message: "Login failed - user not found",
        meta: { email },
      });
      return res.status(404).json({ message: "No account found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await logEvent({
        type: "auth",
        message: "Login failed - wrong password",
        user,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful:", user.email, user.role);

    await logEvent({
      type: "auth",
      message: "User logged in",
      user,
      meta: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.json({
      token,
      user: {
        _id:       user._id,
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error("❌ Login error:", error);

    await logEvent({
      type: "error",
      message: "Login server error",
      meta: { error: error.message },
    });

    res.status(500).json({ error: error.message });
  }
};
