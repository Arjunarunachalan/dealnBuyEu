import { createPost, getPosts } from "./post.service.js";

/**
 * createPostHandler
 * Handles POST /api/posts requests.
 */
export const createPostHandler = async (req, res) => {
  try {
    // req.user._id is heavily reliant on the authentication middleware
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
    // Extract everything from req.query and pass to the service, injecting required country
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
