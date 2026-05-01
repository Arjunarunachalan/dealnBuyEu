import express from "express";
import { submitReport } from "./report.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, submitReport);

export default router;
