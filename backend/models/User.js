import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 10000,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["google", "email", "github"],
      default: "email",
    },
    wallet: {
      type: walletSchema,
      required: true,
      default: () => ({}), // Will use schema defaults
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "dark",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSchema.index({ createdAt: -1 });

// Methods
userSchema.methods.updateBalance = function (amount) {
  this.wallet.balance += amount;
  this.wallet.lastUpdated = new Date();
  return this.save();
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
