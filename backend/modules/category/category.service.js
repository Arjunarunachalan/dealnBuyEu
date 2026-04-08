import Category from "./Category.model.js";

// ─────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────

/**
 * Convert a display name into a URL slug.
 * "Sports Bike!" → "sports-bike"
 */
const toBaseSlug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

/**
 * generateUniqueSlug
 * Generates a slug from name and ensures it is unique in the DB.
 * If "sports-bike" exists → tries "sports-bike-1", "sports-bike-2" …
 *
 * @param {string} name
 * @param {string|null} excludeId - Category _id to exclude (for updates)
 * @returns {Promise<string>} unique slug
 */
export const generateUniqueSlug = async (name, country, excludeId = null) => {
  if (!country) throw new Error("Country is required to generate unique slug.");
  
  const base = toBaseSlug(name);
  let slug = base;
  let counter = 0;

  while (true) {
    const query = { slug, country };
    if (excludeId) query._id = { $ne: excludeId };

    const exists = await Category.findOne(query).lean();
    if (!exists) return slug;

    counter += 1;
    slug = `${base}-${counter}`;
  }
};

/**
 * propagateLevels
 * BFS: When a category moves to a new parent, cascade the new level
 * down to ALL its descendants.
 *
 * @param {ObjectId|string} categoryId - The category that just changed level
 * @param {number} newLevel            - The category's new level
 */
const propagateLevels = async (categoryId, newLevel) => {
  const queue = [{ id: categoryId, level: newLevel }];

  while (queue.length > 0) {
    const { id, level } = queue.shift();

    const children = await Category.find({ parentId: id }).lean();

    for (const child of children) {
      await Category.findByIdAndUpdate(child._id, { level: level + 1 });
      queue.push({ id: child._id, level: level + 1 });
    }
  }
};

/**
 * isCircularParent
 * Walk UP from proposedParentId. If we reach categoryId, it's circular.
 *
 * @param {string} categoryId        - The category being moved
 * @param {string|null} proposedParentId
 * @returns {Promise<boolean>}
 */
const isCircularParent = async (categoryId, proposedParentId) => {
  if (!proposedParentId) return false;

  let cursor = proposedParentId.toString();
  const visited = new Set();

  while (cursor) {
    if (visited.has(cursor)) break; // safety: break infinite loops
    visited.add(cursor);

    if (cursor === categoryId.toString()) return true; // circular!

    const parent = await Category.findById(cursor).select("parentId").lean();
    cursor = parent?.parentId ? parent.parentId.toString() : null;
  }

  return false;
};

/**
 * isDuplicateName
 * Returns true if a sibling with the same name (case-insensitive) already
 * exists under the same parent.
 *
 * @param {string} name
 * @param {string|null} parentId
 * @param {string|null} excludeId - exclude self when updating
 * @returns {Promise<boolean>}
 */
const isDuplicateName = async (name, parentId, country, excludeId = null) => {
  if (!country) throw new Error("Country is required for duplicate check.");
  const query = {
    name: { $regex: `^${name.trim()}$`, $options: "i" },
    parentId: parentId || null,
    isDeleted: false,
    country,
  };
  if (excludeId) query._id = { $ne: excludeId };

  const exists = await Category.findOne(query).lean();
  return !!exists;
};

// ─────────────────────────────────────────────
// PUBLIC SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * createCategory
 * Creates a new category with auto-generated unique slug and auto-calculated level.
 *
 * @param {{ name: string, parentId?: string, icon?: string, order?: number }} data
 * @returns {Promise<Category>}
 */
export const createCategory = async ({ name, parentId = null, icon = "Tag", order = 0, country }) => {
  if (!country) throw new Error("Country is required to create category.");

  // 1. Resolve parent and calculate level
  let level = 0;
  if (parentId) {
    const parent = await Category.findOne({ _id: parentId, country }).lean();
    if (!parent || parent.isDeleted) {
      const err = new Error("Parent category not found.");
      err.statusCode = 404;
      throw err;
    }
    level = parent.level + 1;
  }

  // 2. Duplicate name check under same parent
  const dup = await isDuplicateName(name, parentId, country);
  if (dup) {
    const err = new Error(
      `A category named "${name}" already exists under this parent.`
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Generate unique slug
  const slug = await generateUniqueSlug(name, country);

  // 4. Create
  const category = await Category.create({
    name: name.trim(),
    slug,
    parentId: parentId || null,
    level,
    icon,
    order,
    country,
  });

  return category;
};

/**
 * getCategoryTree
 * Fetches all active, non-deleted categories and builds a nested tree.
 * Sorted by `order` ASC then `name` ASC within each level.
 *
 * @returns {Promise<Array>} - Root-level categories with nested children
 */
export const getCategoryTree = async (country) => {
  if (!country) throw new Error("Country is required to fetch tree.");
  const categories = await Category.find({ isActive: true, isDeleted: false, country })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // Build id → node map
  const map = {};
  categories.forEach((cat) => {
    map[cat._id.toString()] = { ...cat, children: [] };
  });

  const roots = [];

  categories.forEach((cat) => {
    const node = map[cat._id.toString()];
    if (cat.parentId && map[cat.parentId.toString()]) {
      map[cat.parentId.toString()].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

/**
 * updateCategory
 * Updates category fields. Handles:
 *   - Circular parent validation
 *   - Duplicate name check
 *   - Slug regeneration on name change
 *   - Recursive level propagation when parentId changes
 *
 * @param {string} id
 * @param {{ name?: string, parentId?: string, icon?: string, order?: number, isActive?: boolean }} data
 * @returns {Promise<Category>}
 */
export const updateCategory = async (id, data) => {
  const { name, parentId, icon, order, isActive, country } = data;
  if (!country) throw new Error("Country is required for update.");

  const category = await Category.findOne({ _id: id, country });
  if (!category || category.isDeleted) {
    const err = new Error("Category not found or access denied.");
    err.statusCode = 404;
    throw err;
  }

  // Determine final parentId (may or may not be changing)
  const newParentId =
    parentId !== undefined
      ? parentId || null
      : category.parentId?.toString() || null;

  const parentChanging =
    parentId !== undefined &&
    (newParentId || null) !== (category.parentId?.toString() || null);

  // ── Validate parentId change ──────────────────────────────────────────
  if (parentChanging) {
    // Cannot set self as parent
    if (newParentId && newParentId === id) {
      const err = new Error("A category cannot be its own parent.");
      err.statusCode = 400;
      throw err;
    }

    // Circular check
    const circular = await isCircularParent(id, newParentId);
    if (circular) {
      const err = new Error(
        "Circular parent assignment detected. A category cannot be a child of its own descendant."
      );
      err.statusCode = 400;
      throw err;
    }
  }

  // ── Resolve new level ─────────────────────────────────────────────────
  let newLevel = category.level;
  if (parentChanging) {
    if (newParentId) {
      const newParent = await Category.findOne({ _id: newParentId, country }).lean();
      if (!newParent || newParent.isDeleted) {
        const err = new Error("New parent category not found.");
        err.statusCode = 404;
        throw err;
      }
      newLevel = newParent.level + 1;
    } else {
      newLevel = 0; // Promoted to root
    }
  }

  // ── Duplicate name check ──────────────────────────────────────────────
  const effectiveName = name !== undefined ? name : category.name;
  const nameChanging = name !== undefined && name.trim() !== category.name;

  if (nameChanging || parentChanging) {
    const targetParentId = parentChanging ? newParentId : newParentId;
    const dup = await isDuplicateName(effectiveName, targetParentId, country, id);
    if (dup) {
      const err = new Error(
        `A category named "${effectiveName}" already exists under this parent.`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  // ── Regenerate slug if name changed ───────────────────────────────────
  if (nameChanging) {
    category.name = name.trim();
    category.slug = await generateUniqueSlug(name, country, id);
  }

  // ── Apply field updates ───────────────────────────────────────────────
  if (parentChanging) {
    category.parentId = newParentId || null;
    category.level = newLevel;
  }
  if (icon !== undefined) category.icon = icon;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  // ── Cascade level update to ALL descendants ───────────────────────────
  if (parentChanging) {
    await propagateLevels(category._id, newLevel);
  }

  return category;
};

/**
 * toggleCategoryStatus
 * Flips isActive for a category (soft enable/disable).
 *
 * @param {string} id
 * @returns {Promise<Category>}
 */
export const toggleCategoryStatus = async (id, country) => {
  if (!country) throw new Error("Country is required to toggle status.");
  const category = await Category.findOne({ _id: id, country });
  if (!category || category.isDeleted) {
    const err = new Error("Category not found or access denied.");
    err.statusCode = 404;
    throw err;
  }

  category.isActive = !category.isActive;
  await category.save();

  return category;
};

/**
 * getCategoryPath  [Future-ready helper — not exposed as API yet]
 * Walks from categoryId up to the root and returns the full ancestor chain.
 * Returns an array of ObjectIds: [rootId, ..., categoryId]
 *
 * Usage in Phase 2: filter posts where post.categoryId is in getCategoryPath(selectedId)
 *
 * @param {string} categoryId
 * @returns {Promise<string[]>} - Ordered [root → ... → categoryId]
 */
export const getCategoryPath = async (categoryId) => {
  const path = [];
  let cursor = categoryId;

  while (cursor) {
    const cat = await Category.findById(cursor).select("_id parentId").lean();
    if (!cat) break;
    path.unshift(cat._id.toString()); // prepend to keep root-first order
    cursor = cat.parentId ? cat.parentId.toString() : null;
  }

  return path;
};

/**
 * updateCategoryAttributes
 * Validates that the category is a leaf node, then sets dynamic attributes.
 *
 * @param {string} categoryId
 * @param {Array} attributes
 * @returns {Promise<Category>}
 */
export const updateCategoryAttributes = async (categoryId, attributes, country) => {
  if (!country) throw new Error("Country is required to update attributes.");
  // Check if it exists
  const category = await Category.findOne({ _id: categoryId, country });
  if (!category || category.isDeleted) {
    const err = new Error("Category not found or access denied.");
    err.statusCode = 404;
    throw err;
  }

  // Ensure it's a leaf node
  const childCount = await Category.countDocuments({ parentId: categoryId, isDeleted: false });
  if (childCount > 0) {
    const err = new Error("Attributes can only be assigned to final (leaf) categories.");
    err.statusCode = 400;
    throw err;
  }

  // Validate attribute keys are unique
  const keys = new Set();
  for (const attr of attributes) {
    if (keys.has(attr.key)) {
      const err = new Error(`Duplicate attribute key found: ${attr.key}`);
      err.statusCode = 400;
      throw err;
    }
    keys.add(attr.key);

    // Enforce options for select/radio/checkbox
    const requiresOptions = ["select", "radio", "checkbox"].includes(attr.type);
    if (requiresOptions && (!attr.options || attr.options.length === 0)) {
      const err = new Error(`Attribute '${attr.key}' of type '${attr.type}' requires options.`);
      err.statusCode = 400;
      throw err;
    }
    
    // Clear options if type does not require them
    if (!requiresOptions) {
      attr.options = [];
    }
  }

  category.attributes = attributes;
  await category.save();

  return category;
};

/**
 * getCategoryFilters
 * Returns only the filterable attributes for a given category.
 *
 * @param {string} categoryId
 * @returns {Promise<Object>}
 */
export const getCategoryFilters = async (categoryId, country) => {
  if (!country) throw new Error("Country is required to fetch filters.");
  const category = await Category.findOne({ _id: categoryId, country })
    .select("attributes")
    .lean();

  if (!category) {
    const err = new Error("Category not found or access denied.");
    err.statusCode = 404;
    throw err;
  }

  const filters = (category.attributes || []).filter((a) => a.filterable);

  return { attributes: filters };
};
