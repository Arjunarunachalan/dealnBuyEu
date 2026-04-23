import express from "express";
import { getLegalPage, updateLegalPage } from "../controllers/legalPageController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:pageName", getLegalPage);
router.put("/:pageName", protect, adminOnly, updateLegalPage);

export default router;
