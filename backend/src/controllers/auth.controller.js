// C:\AI-Exam-System\backend\src\controllers\auth.controller.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logEvent } from "../utils/logger.js";
import { verifyGoogleToken } from "../config/googleAuth.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const getClientIP = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  req.ip ||
  null;

const safeUserResponse = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
  isEmailVerified: user.isEmailVerified,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      await logEvent({
        type: "auth",
        action: "REGISTER_FAILED",
        message: "Registration failed - email already exists",
        meta: { email: cleanEmail },
      });

      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: "student",
      authProvider: "local",
      isEmailVerified: false,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    await logEvent({
      type: "auth",
      action: "REGISTER_SUCCESS",
      message: "Student registered successfully",
      user,
      meta: {
        provider: "local",
      },
    });

    return res.status(201).json({
      message: "Account created successfully. Please login.",
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Unable to create account",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been disabled",
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({
        message: "Too many failed login attempts. Please try again later.",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        message:
          "This account uses Google Login. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        return res.status(423).json({
          message:
            "Too many failed attempts. Your account is temporarily locked.",
        });
      }

      await user.save();

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    user.lastLoginIP = getClientIP(req);

    await user.save();

    const token = generateToken(user);

    await logEvent({
      type: "auth",
      action: "LOGIN_SUCCESS",
      message: "User logged in successfully",
      user,
      meta: {
        provider: user.authProvider,
        ip: getClientIP(req),
        userAgent: req.headers["user-agent"],
      },
      status: "success",
    });

    return res.json({
      message: "Login successful",
      token,
      user: safeUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login",
    });
  }
};
 
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    let payload;
    try {
      payload = await verifyGoogleToken(credential);
    } catch (err) {
      console.error("Google token verification failed:", err.message);
      return res.status(401).json({
        message: "Invalid or expired Google credential",
      });
    }

    const cleanEmail = normalizeEmail(payload.email);

    let user = await User.findOne({
      $or: [{ googleId: payload.googleId }, { email: cleanEmail }],
    });

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          message: "Your account has been disabled",
        });
      }

      if (!user.googleId) {
        user.googleId = payload.googleId;
      }

      if (user.authProvider === "local" && !user.password) {
        user.authProvider = "google";
      }

      user.isEmailVerified = true;
      user.profilePicture = user.profilePicture || payload.picture || null;
      user.googleProfile = {
        email: cleanEmail,
        picture: payload.picture || null,
        lastVerifiedAt: new Date(),
      };
    } else {
      user = new User({
        name: payload.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        googleId: payload.googleId,
        authProvider: "google",
        role: "student",
        isEmailVerified: true,
        isActive: true,
        profilePicture: payload.picture || null,
        googleProfile: {
          email: cleanEmail,
          picture: payload.picture || null,
          lastVerifiedAt: new Date(),
        },
      });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    user.lastLoginIP = getClientIP(req);

    await user.save();

    const token = generateToken(user);

    await logEvent({
      type: "auth",
      action: "GOOGLE_LOGIN_SUCCESS",
      message: "User logged in with Google",
      user,
      meta: {
        provider: "google",
        ip: getClientIP(req),
        userAgent: req.headers["user-agent"],
      },
      status: "success",
    });

    return res.json({
      message: "Login successful",
      token,
      user: safeUserResponse(user),
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      message: "Google login failed",
    });
  }
};