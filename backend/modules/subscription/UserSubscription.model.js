import mongoose from "mongoose";

/**
 * UserSubscription
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks each user's active/historical subscription.
 * activatedVia: "posts" (free path) | "payment" (paid path)
 */
const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: String,
      enum: ["silver", "golden", "platinum"],
      required: true,
    },
    country: {
      type: String,
      required: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    activatedVia: {
      type: String,
      enum: ["posts", "payment"],
      required: true,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    // Stripe payment reference (populated on paid activation)
    paymentRef: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Only one ACTIVE subscription per user at a time
userSubscriptionSchema.index({ userId: 1, status: 1 });
userSubscriptionSchema.index({ expiresAt: 1 });

const UserSubscription = mongoose.model("UserSubscription", userSubscriptionSchema);

export default UserSubscription;
