import express from "express";
import { updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// The protect middleware ensures that a valid access token is parsed, 
// and `req.user` is populated before allowing the update.
router.put("/profile", protect, updateUserProfile);

export default router;
