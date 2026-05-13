import express from "express";
import { protect, adminOnly, superAdminOnly } from "../../middleware/authMiddleware.js";
import { getStats, getUsers, changeUserRole, getReports, updateReportStatus, getPremiumUsers, getPosts, getAds, getContactMessages, sendNotification } from "./admin.controller.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", protect, adminOnly, getStats);

// GET /api/admin/users
router.get("/users", protect, adminOnly, getUsers);

// PATCH /api/admin/users/:id/role — super_admin only
router.patch("/users/:id/role", protect, superAdminOnly, changeUserRole);

// GET /api/admin/reports
router.get("/reports", protect, adminOnly, getReports);

// PATCH /api/admin/reports/:id
router.patch("/reports/:id", protect, adminOnly, updateReportStatus);

// GET /api/admin/premium-users
router.get("/premium-users", protect, adminOnly, getPremiumUsers);

// GET /api/admin/posts
router.get("/posts", protect, adminOnly, getPosts);

// GET /api/admin/ads
router.get("/ads", protect, adminOnly, getAds);

// GET /api/admin/contact-messages
router.get("/contact-messages", protect, adminOnly, getContactMessages);

// POST /api/admin/notifications/send
router.post("/notifications/send", protect, adminOnly, sendNotification);

export default router;
