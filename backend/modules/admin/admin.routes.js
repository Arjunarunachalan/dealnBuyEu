import express from "express";
import { protect, adminOnly, superAdminOnly } from "../../middleware/authMiddleware.js";
import { getStats, getUsers, changeUserRole, getReports, updateReportStatus } from "./admin.controller.js";

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

export default router;
