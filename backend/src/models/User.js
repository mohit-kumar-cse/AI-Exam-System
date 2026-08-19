// backend/src/models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    password: {
      type: String,
      default: undefined,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    role: {
      type: String,
      enum: ["student", "admin", "examiner"],
      default: "student",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    lastLoginIP: {
      type: String,
      default: null,
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    profilePicture: {
      type: String,
      default: null,
      trim: true,
    },

    security: {
      lastLoginAt: {
        type: Date,
        default: null,
      },

      lastLoginIP: {
        type: String,
        default: null,
        select: false,
      },

      lastUserAgent: {
        type: String,
        default: null,
        select: false,
      },

      loginCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      securityRiskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    googleProfile: {
      email: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
      },

      picture: {
        type: String,
        default: null,
      },

      lastVerifiedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    minimize: true,
  }
);

 
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ lockedUntil: 1 });

 
userSchema.pre("save", async function () {
 
  if (!this.isModified("password")) {
    return;
  }

   
  if (!this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

 
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);