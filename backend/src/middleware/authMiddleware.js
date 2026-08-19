// C:\AI-Exam-System\backend\src\middleware\authMiddleware.js
import jwt from "jsonwebtoken";

export const protect = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token =
    authHeader.substring(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error(
      "JWT_SECRET is not configured"
    );

    return res.status(500).json({
      message:
        "Authentication configuration error",
    });
  }

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (
      !decoded ||
      !decoded.id ||
      !decoded.role
    ) {
      return res.status(401).json({
        message:
          "Invalid authentication token",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
};