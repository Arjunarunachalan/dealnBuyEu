import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead, clearNotification } from "./notification.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/notifications
router.get("/", protect, getMyNotifications);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", protect, markAsRead);

// PATCH /api/notifications/mark-all-read
router.patch("/mark-all-read", protect, markAllAsRead);

// PATCH /api/notifications/:id/clear
router.patch("/:id/clear", protect, clearNotification);

export default router;
