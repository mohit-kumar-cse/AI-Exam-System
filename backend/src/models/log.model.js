// backend/src/models/log.model.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["auth", "exam", "admin", "error", "student", "system"],
      default: "system",
    },
    message: {
      type: String,
      required: true,
    },
    user: {
      id:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name:  String,
      email: String,
    },
    meta: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);