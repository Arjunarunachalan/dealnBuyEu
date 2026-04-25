import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  createPostHandler,
  getPostsHandler,
  getPostByIdHandler,
  getMyPostsHandler,
  updatePostHandler,
  deletePostHandler,
} from "./post.controller.js";

const postRoutes = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/posts — Public: search/browse all active posts
postRoutes.get("/", getPostsHandler);

// ── Owner-scoped protected routes (must be before /:id) ───────────────────────

// GET /api/posts/my — Protected: fetch the logged-in user's own posts
postRoutes.get("/my", protect, getMyPostsHandler);

// ── Single-post routes ────────────────────────────────────────────────────────

// GET /api/posts/:id — Public: single post detail
postRoutes.get("/:id", getPostByIdHandler);

// POST /api/posts — Protected: create a new post
postRoutes.post("/", protect, createPostHandler);

// PUT /api/posts/:id — Protected: update own post (isActive, title, price…)
postRoutes.put("/:id", protect, updatePostHandler);

// DELETE /api/posts/:id — Protected: permanently delete own post
postRoutes.delete("/:id", protect, deletePostHandler);

export default postRoutes;
