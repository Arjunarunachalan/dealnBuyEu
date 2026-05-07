/**
 * Seed Script — Subscription Plans (France / EUR)
 * ─────────────────────────────────────────────────────────────────────────────
 * Run: node backend/scripts/seedSubscriptionPlans.js
 *
 * Seeds 3 plans for France (FR) with dual-unlock pricing.
 * Safe to re-run — uses upsert so it won't create duplicates.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// Inline schema to avoid circular deps in seed script
const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: { type: String, enum: ["silver", "golden", "platinum"], required: true },
    country: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "EUR" },
    unlockThreshold: { type: Number, required: true, min: 0 },
    validityDays: { type: Number, default: 30 },
    boostsPerMonth: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
subscriptionPlanSchema.index({ planId: 1, country: 1 }, { unique: true });

const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

const FRANCE_PLANS = [
  {
    planId: "silver",
    country: "FR",
    name: "Silver Plan",
    description: "Perfect for getting started. Unlock for free by posting ads.",
    features: [
      "2 Boosts per month",
      "Featured on single category top",
      "30 days validity",
      "Unlock free: post 10 ads OR pay €2.99",
    ],
    price: 2.99,
    currency: "EUR",
    unlockThreshold: 10,
    validityDays: 30,
    boostsPerMonth: 2,
    isActive: true,
  },
  {
    planId: "golden",
    country: "FR",
    name: "Golden Plan",
    description: "For active sellers. Get homepage visibility and more boosts.",
    features: [
      "3 Boosts per month",
      "Featured on Home Page",
      "30 days validity",
      "Unlock free: post 20 ads OR pay €5.99",
    ],
    price: 5.99,
    currency: "EUR",
    unlockThreshold: 20,
    validityDays: 30,
    boostsPerMonth: 3,
    isActive: true,
  },
  {
    planId: "platinum",
    country: "FR",
    name: "Platinum Plan",
    description: "Maximum visibility. Top placement across the entire platform.",
    features: [
      "4 Boosts per month",
      "Top placement on Home Page",
      "Priority customer support",
      "30 days validity",
      "Unlock free: post 40 ads OR pay €9.99",
    ],
    price: 9.99,
    currency: "EUR",
    unlockThreshold: 40,
    validityDays: 30,
    boostsPerMonth: 4,
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const plan of FRANCE_PLANS) {
      const result = await SubscriptionPlan.findOneAndUpdate(
        { planId: plan.planId, country: plan.country },
        { $set: plan },
        { upsert: true, new: true }
      );
      console.log(`✅ Upserted plan: ${result.name} (${result.country}) @ €${result.price}`);
    }

    console.log("\n🎉 Subscription plans seeded successfully!");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
