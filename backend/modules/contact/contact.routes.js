import express from "express";
import { submitContactMessage } from "./contact.controller.js";
import { optionalAuth } from "../../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/contact
router.post("/", optionalAuth, submitContactMessage);

export default router;
