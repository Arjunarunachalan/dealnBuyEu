import express from "express";
import { protect, adminOnly, superAdminOnly } from "../../middleware/authMiddleware.js";
import { getStats, getUsers, changeUserRole } from "./admin.controller.js";

const router = express.Router();

// GET /api/admin/stats — admin + super_admin
router.get("/stats", protect, adminOnly, getStats);

// GET /api/admin/users — admin + super_admin
router.get("/users", protect, adminOnly, getUsers);

// PATCH /api/admin/users/:id/role — super_admin only
router.patch("/users/:id/role", protect, superAdminOnly, changeUserRole);

export default router;
