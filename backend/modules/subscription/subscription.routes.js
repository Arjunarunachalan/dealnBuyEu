import express from "express";
import { protect, adminOnly } from "../../middleware/authMiddleware.js";
import {
  getPlans,
  getMySubscription,
  activateFreePlan,
  initiatePayment,
  confirmPayment,
  adminGetPlans,
  adminUpdatePlan,
} from "./subscription.controller.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
// GET /api/subscriptions/plans
router.get("/plans", getPlans);

// ── User-protected ────────────────────────────────────────────────────────────
// GET /api/subscriptions/my
router.get("/my", protect, getMySubscription);

// POST /api/subscriptions/activate-free
router.post("/activate-free", protect, activateFreePlan);

// POST /api/subscriptions/initiate-payment
router.post("/initiate-payment", protect, initiatePayment);

// POST /api/subscriptions/confirm-payment
router.post("/confirm-payment", protect, confirmPayment);

// ── Admin ─────────────────────────────────────────────────────────────────────
// GET /api/subscriptions/admin/plans
router.get("/admin/plans", protect, adminOnly, adminGetPlans);

// PATCH /api/subscriptions/admin/plans/:id
router.patch("/admin/plans/:id", protect, adminOnly, adminUpdatePlan);

export default router;
