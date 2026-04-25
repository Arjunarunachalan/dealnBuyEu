import Post from "./Post.model.js";
import Category from "../category/Category.model.js";

/**
 * searchHandler
 * Handles GET /api/search?q=<query>
 * Returns grouped results: products, categories, locations
 */
export const searchHandler = async (req, res) => {
  try {
    const { q } = req.query;
    const country = req.country;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        data: { products: [], categories: [], locations: [] },
      });
    }

    const query = q.trim();
    // Build a case-insensitive regex
    const regex = new RegExp(query, "i");

    // ── 1. Products (title match, active, correct country) ─────────────
    const productPromise = Post.find({
      country,
      isActive: true,
      title: { $regex: regex },
    })
      .select("title price images location categoryId")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // ── 2. Categories (name match, active, correct country) ─────────────
    const categoryPromise = Category.find({
      country,
      isActive: true,
      isDeleted: false,
      name: { $regex: regex },
    })
      .select("name slug icon level parentId")
      .sort({ level: 1 })
      .limit(5)
      .lean();

    // ── 3. Locations — distinct cities/districts from posts ──────────────
    const locationPromise = Post.aggregate([
      {
        $match: {
          country,
          isActive: true,
          $or: [
            { "location.city": { $regex: regex } },
            { "location.district": { $regex: regex } },
          ],
        },
      },
      {
        $group: {
          _id: {
            city: "$location.city",
            district: "$location.district",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
      {
        $project: {
          _id: 0,
          city: "$_id.city",
          district: "$_id.district",
          count: 1,
        },
      },
    ]);

    const [products, categories, locationAgg] = await Promise.all([
      productPromise,
      categoryPromise,
      locationPromise,
    ]);

    // Deduplicate & format locations
    const locationSet = new Set();
    const locations = [];
    for (const loc of locationAgg) {
      const label = [loc.city, loc.district].filter(Boolean).join(", ");
      if (label && !locationSet.has(label)) {
        locationSet.add(label);
        locations.push({ label, city: loc.city, district: loc.district, count: loc.count });
      }
    }

    return res.status(200).json({
      success: true,
      data: { products, categories, locations },
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Search failed.",
    });
  }
};
