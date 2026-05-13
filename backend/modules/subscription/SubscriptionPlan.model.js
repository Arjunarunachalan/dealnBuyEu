import mongoose from "mongoose";

/**
 * SubscriptionPlan
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-managed plan definitions. Each plan supports two unlock paths:
 *  1. User posts ≥ unlockThreshold ads → free activation
 *  2. User pays price EUR → instant activation (Stripe)
 *
 * Country-scoped so pricing can differ per market.
 */
const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      enum: ["silver", "golden", "platinum"],
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "FR",
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    // ── Paid unlock ───────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "EUR",
    },
    // ── Free (post-count) unlock ───────────────────────────────────────────────
    unlockThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
    // ── Plan settings ─────────────────────────────────────────────────────────
    validityDays: {
      type: Number,
      default: 30,
    },
    boostsPerMonth: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique plan per country
subscriptionPlanSchema.index({ planId: 1, country: 1 }, { unique: true });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
