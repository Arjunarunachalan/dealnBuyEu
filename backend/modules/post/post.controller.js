import { createPost, getPosts, getPostById, getMyPosts, updatePost, deletePost } from "./post.service.js";

/**
 * createPostHandler
 * Handles POST /api/posts requests.
 */
export const createPostHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID not found.",
      });
    }

    const post = await createPost({ ...req.body, country: req.country }, userId);

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: post,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to create post.",
    });
  }
};

/**
 * getPostsHandler
 * Handles GET /api/posts requests.
 */
export const getPostsHandler = async (req, res) => {
  try {
    const result = await getPosts({ ...req.query, country: req.country });

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully.",
      data: {
        posts: result.posts,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch posts.",
    });
  }
};

/**
 * getPostByIdHandler
 * Handles GET /api/posts/:id requests.
 */
export const getPostByIdHandler = async (req, res) => {
  try {
    const post = await getPostById(req.params.id, req.country);

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch post.",
    });
  }
};

/**
 * getMyPostsHandler
 * Handles GET /api/posts/my — returns posts owned by the authenticated user.
 */
export const getMyPostsHandler = async (req, res) => {
  try {
    const result = await getMyPosts(req.user._id, req.country, req.query);

    return res.status(200).json({
      success: true,
      message: "Your posts fetched successfully.",
      data: {
        posts: result.posts,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        counts: result.counts,
      },
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch your posts.",
    });
  }
};

/**
 * updatePostHandler
 * Handles PUT /api/posts/:id — updates an owned post (title, description, price, isActive).
 */
export const updatePostHandler = async (req, res) => {
  try {
    const updated = await updatePost(req.params.id, req.user._id, req.country, req.body);

    return res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      data: updated,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to update post.",
    });
  }
};

/**
 * deletePostHandler
 * Handles DELETE /api/posts/:id — permanently removes an owned post.
 */
export const deletePostHandler = async (req, res) => {
  try {
    const result = await deletePost(req.params.id, req.user._id, req.country);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
      data: result,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to delete post.",
    });
  }
};
