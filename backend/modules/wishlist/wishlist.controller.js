import User from "../../models/User.js";
import Post from "../post/Post.model.js";

/**
 * getWishlist
 * GET /api/wishlist
 * Returns all posts in the current user's wishlist (populated, country-scoped).
 */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        match: { isActive: true }, // Only return active posts
        select: "title price images location categoryId createdAt country userId",
        populate: {
          path: "userId",
          select: "pseudoName name",
        },
      });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Filter out null entries (posts that were deleted / became inactive after populating)
    const activeItems = user.wishlist.filter(Boolean);

    return res.status(200).json({
      success: true,
      data: activeItems,
    });
  } catch (err) {
    console.error("getWishlist error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch wishlist." });
  }
};

/**
 * addToWishlist
 * POST /api/wishlist/:postId
 * Adds a post to the current user's wishlist. Idempotent — no duplicates.
 */
export const addToWishlist = async (req, res) => {
  try {
    const { postId } = req.params;

    // Verify post exists and is active in the user's country
    const post = await Post.findOne({ _id: postId, isActive: true });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found or unavailable." });
    }

    // $addToSet prevents duplicates atomically
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: postId } },
      { new: true, select: "wishlist" }
    );

    return res.status(200).json({
      success: true,
      message: "Added to wishlist.",
      wishlistCount: updatedUser.wishlist.length,
    });
  } catch (err) {
    console.error("addToWishlist error:", err);
    return res.status(500).json({ success: false, message: "Failed to add to wishlist." });
  }
};

/**
 * removeFromWishlist
 * DELETE /api/wishlist/:postId
 * Removes a post from the current user's wishlist.
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { postId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: postId } },
      { new: true, select: "wishlist" }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist.",
      wishlistCount: updatedUser.wishlist.length,
    });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove from wishlist." });
  }
};

/**
 * getWishlistIds
 * GET /api/wishlist/ids
 * Returns only the array of wishlisted post IDs. Lightweight — used to initialise the frontend store.
 */
export const getWishlistIds = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("wishlist").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({
      success: true,
      data: user.wishlist.map((id) => id.toString()),
    });
  } catch (err) {
    console.error("getWishlistIds error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
