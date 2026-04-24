import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getWishlist,
  getWishlistIds,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist.controller.js";

const router = express.Router();

// All wishlist routes require authentication
router.get("/", protect, getWishlist);           // Full populated wishlist
router.get("/ids", protect, getWishlistIds);     // Lightweight: only IDs (for store init)
router.post("/:postId", protect, addToWishlist);
router.delete("/:postId", protect, removeFromWishlist);

export default router;
