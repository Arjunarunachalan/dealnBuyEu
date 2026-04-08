import {
  createCategory,
  getCategoryTree,
  updateCategory,
  toggleCategoryStatus,
  updateCategoryAttributes,
  getCategoryFilters,
} from "./category.service.js";

// ─────────────────────────────────────────────
// POST /api/admin/categories
// ─────────────────────────────────────────────
export const createCategoryHandler = async (req, res) => {
  try {
    const { name, parentId, icon, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const category = await createCategory({ name, parentId, icon, order, country: req.country });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to create category.",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/categories (public)
// ─────────────────────────────────────────────
export const getCategoriesHandler = async (req, res) => {
  try {
    const tree = await getCategoryTree(req.country);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: tree,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch categories.",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/categories/:id
// ─────────────────────────────────────────────
export const updateCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, icon, order, isActive } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update fields provided.",
      });
    }

    const updated = await updateCategory(id, {
      name,
      parentId,
      icon,
      order,
      isActive,
      country: req.country,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: updated,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to update category.",
    });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/categories/:id/status
// ─────────────────────────────────────────────
export const toggleCategoryStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await toggleCategoryStatus(id, req.country);

    return res.status(200).json({
      success: true,
      message: `Category ${updated.isActive ? "activated" : "deactivated"} successfully.`,
      data: { _id: updated._id, isActive: updated.isActive },
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to toggle category status.",
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/admin/categories/:id/attributes
// ─────────────────────────────────────────────
export const updateCategoryAttributesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { attributes } = req.body;

    if (!Array.isArray(attributes)) {
      return res.status(400).json({
        success: false,
        message: "'attributes' must be an array.",
      });
    }

    const updated = await updateCategoryAttributes(id, attributes, req.country);

    return res.status(200).json({
      success: true,
      message: "Category attributes updated successfully.",
      data: updated,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to update category attributes.",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/categories/:id/filters (public)
// ─────────────────────────────────────────────
export const getCategoryFiltersHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const filters = await getCategoryFilters(id, req.country);

    return res.status(200).json({
      success: true,
      message: "Category filters fetched successfully.",
      data: filters,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch category filters.",
    });
  }
};
