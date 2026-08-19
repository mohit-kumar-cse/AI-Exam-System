// backend/src/models/log.model.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["auth", "exam", "admin", "error", "student", "system", "ai", "security"],
      default: "system",
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      name: { type: String, default: null },
      email: { type: String, default: null, lowercase: true },
      role: { type: String, enum: ["student", "admin", "examiner"], default: null },
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
    },

    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
      select: false,
    },

    userAgent: {
      type: String,
      default: null,
      select: false,
    },

    status: {
      type: String,
      enum: ["success", "failed", "warning", "critical", "info"],
      default: "info",
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ "user.id": 1, createdAt: -1 });
logSchema.index({ exam: 1, createdAt: -1 });
logSchema.index({ submission: 1, createdAt: -1 });
logSchema.index({ status: 1, createdAt: -1 });
logSchema.index({ createdAt: -1 });

export default mongoose.model("Log", logSchema);