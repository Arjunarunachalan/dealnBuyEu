import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { createPostHandler, getPostsHandler, getPostByIdHandler } from "./post.controller.js";

const postRoutes = express.Router();

// GET /api/posts - Public API for searching/viewing posts
postRoutes.get("/", getPostsHandler);

// GET /api/posts/:id - Public API for single post retrieval securely
postRoutes.get("/:id", getPostByIdHandler);

// POST /api/posts - Protected API for creating new posts
postRoutes.post("/", protect, createPostHandler);

export default postRoutes;
