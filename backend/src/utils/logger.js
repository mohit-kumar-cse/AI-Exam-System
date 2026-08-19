// C:\AI-Exam-System\backend\src\utils\logger.js
import Log from "../models/log.model.js";

const formatUser = (user) => {
  if (!user) {
    return null;
  }

  if (
    !user._id &&
    typeof user !== "object"
  ) {
    return {
      id: user,
      name: "Unknown",
      email: "Unknown",
      role: null,
    };
  }

  return {
    id: user._id || user.id || user,
    name: user.name || "Unknown",
    email: user.email || "Unknown",
    role: user.role || null,
  };
};

export const logEvent = async ({
  type = "system",
  action = "UNKNOWN_ACTION",
  message = "System event",
  user = null,
  exam = null,
  submission = null,
  ipAddress = null,
  userAgent = null,
  status = "info",
  meta = {},
}) => {
  try {
    await Log.create({
      type,
      action,
      message,
      user: formatUser(user),
      exam,
      submission,
      ipAddress,
      userAgent,
      status,
      meta,
    });
  } catch (error) {
    console.error(
      "logEvent error:",
      error.message
    );
  }
};

export const createLog = async ({
  user = null,
  action = "UNKNOWN_ACTION",
  resource = null,
  metadata = {},
  exam = null,
  submission = null,
  status = "info",
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await Log.create({
      type: "student",
      action,
      message: action,
      user: formatUser(user),
      exam,
      submission,
      ipAddress,
      userAgent,
      status,
      meta: {
        resource,
        ...metadata,
      },
    });
  } catch (error) {
    console.error(
      "createLog error:",
      error.message
    );
  }
};