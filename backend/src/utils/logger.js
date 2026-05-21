// backend/src/utils/logger.js
import Log from "../models/log.model.js";   // ✅ correct filename

/* ── Generic logger ──────────────────────────────────────────────────────── */
export const logEvent = async ({
  type = "system",
  message,
  user = null,
  meta = {},
}) => {
  try {
    await Log.create({
      type,
      message,
      user: user
        ? { id: user._id || user, name: user.name || "Unknown", email: user.email || "N/A" }
        : null,
      meta,
    });
  } catch (err) {
    console.error("❌ logEvent error:", err.message);
  }
};

/* ── createLog — used by submissionController ────────────────────────────── */
export const createLog = async ({ user, action, resource, metadata }) => {
  try {
    await Log.create({
      type:    "student",
      message: action,          // message is required in log.model.js
      user:    user
        ? { id: user, name: "Student", email: "N/A" }
        : null,
      meta:    { resource, ...metadata },
    });
  } catch (err) {
    console.error("❌ createLog error:", err.message);
  }
};