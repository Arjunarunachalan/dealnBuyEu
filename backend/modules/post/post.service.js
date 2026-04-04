import Post from "./Post.model.js";
import Category from "../category/Category.model.js";
import { getCategoryPath } from "../category/category.service.js";

// ─────────────────────────────────────────────
// HIGHER ORDER HELPERS
// ─────────────────────────────────────────────

/**
 * normalizeValueByType
 * Normalizes input based on semantic attribute types.
 * Trims strings, parses numbers/booleans securely.
 */
const normalizeValueByType = (value, type) => {
  if (value === undefined || value === null) return value;

  switch (type) {
    case "number":
      const parsedNum = Number(value);
      if (isNaN(parsedNum)) throw new Error("Expected a valid number.");
      return parsedNum;

    case "boolean":
      if (typeof value === "boolean") return value;
      if (value === "true") return true;
      if (value === "false") return false;
      throw new Error("Expected boolean (true/false).");

    case "text":
    case "select":
    case "radio":
      return String(value).trim().toLowerCase();

    case "checkbox":
      const arr = Array.isArray(value) ? value : [value];
      return arr.map((v) => String(v).trim().toLowerCase());

    default:
      return String(value).trim().toLowerCase();
  }
};

/**
 * validateAndNormalizeAttributes
 * Ensures all submitted attributes strictly map to the specific category's attribute schema.
 * Rejects unknown attributes, validates types, sizes, and matches predefined options exactly.
 */
const validateAndNormalizeAttributes = (categoryAttributes, userAttributes) => {
  const validAttributes = {};
  const schemaKeys = categoryAttributes.map((attr) => attr.key);

  // 1. Block unknown attributes
  for (const key of Object.keys(userAttributes)) {
    if (!schemaKeys.includes(key)) {
      const err = new Error(`Unknown attribute passed: '${key}'`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 2. Validate against schema
  for (const attrDef of categoryAttributes) {
    const { key, type, required, options, label } = attrDef;
    let providedValue = userAttributes[key];

    // Check required
    if (required && (providedValue === undefined || providedValue === null || providedValue === "")) {
      const err = new Error(`Attribute '${label || key}' is required.`);
      err.statusCode = 400;
      throw err;
    }

    if (providedValue !== undefined && providedValue !== null && providedValue !== "") {
      try {
        // Normalize the exact type requested
        providedValue = normalizeValueByType(providedValue, type);
      } catch (e) {
        const err = new Error(`Attribute '${label || key}': ${e.message}`);
        err.statusCode = 400;
        throw err;
      }

      // Check options correctly matched (pre-normalize schema options for comparison)
      if (["select", "radio", "checkbox"].includes(type)) {
        const normalizedOptions = options.map((opt) => opt.trim().toLowerCase());
        const valArray = Array.isArray(providedValue) ? providedValue : [providedValue];

        for (const val of valArray) {
          if (!normalizedOptions.includes(val)) {
            const err = new Error(
              `Invalid option '${val}' for '${label || key}'. Valid options are: ${options.join(", ")}`
            );
            err.statusCode = 400;
            throw err;
          }
        }
      }

      validAttributes[key] = providedValue;
    }
  }

  return validAttributes;
};

/**
 * buildSortQuery
 * Standardizes sorting strings into MongoDB sorting directives.
 */
const buildSortQuery = (sortOption) => {
  switch (sortOption) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "latest":
    default:
      return { createdAt: -1 };
  }
};

/**
 * buildFilterQuery
 * Constructs scalable MongoDB db queries tracking schema bindings precisely
 */
const buildFilterQuery = (queryParams, category) => {
  const { categoryId, categorySlug, minPrice, maxPrice, ...dynamicParams } = queryParams;
  const dbQuery = { isActive: true };

  // Category specific paths match all descendants smoothly without manual loop
  if (categoryId) {
    dbQuery.categoryPath = categoryId;
  }

  // Handle generic standardized filters securely
  if (minPrice !== undefined || maxPrice !== undefined) {
    dbQuery.price = {};
    if (minPrice !== undefined) dbQuery.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) dbQuery.price.$lte = Number(maxPrice);
  }

  const reservedKeys = ["page", "limit", "sort"];
  const filterKeys = Object.keys(dynamicParams).filter(k => !reservedKeys.includes(k));

  if (filterKeys.length > 0) {
    if (!categoryId || !category || !category.attributes) {
      const err = new Error("Dynamic attribute filtering strictly requires a specific 'categoryId' or 'categorySlug'.");
      err.statusCode = 400;
      throw err;
    }

    const validDynamicKeys = category.attributes.map((a) => a.key);
    
    for (const key of filterKeys) {
      const value = dynamicParams[key];

      if (!validDynamicKeys.includes(key)) {
        const err = new Error(`Unknown filter attribute: '${key}'. Valid attributes for this category are: ${validDynamicKeys.join(", ")}`);
        err.statusCode = 400;
        throw err;
      }

      const attrDef = category.attributes.find((a) => a.key === key);
      try {
        if (Array.isArray(value)) {
           const normalizedArray = value.map(v => normalizeValueByType(v, attrDef.type));
           dbQuery[`attributes.${key}`] = { $in: normalizedArray };
        } else {
           const normValue = normalizeValueByType(value, attrDef.type);
           
           if (attrDef.type === "checkbox") {
              dbQuery[`attributes.${key}`] = { $in: [normValue] };
           } else {
              dbQuery[`attributes.${key}`] = normValue;
           }
        }
      } catch (e) {
        const err = new Error(`Filter '${key}': ${e.message}`);
        err.statusCode = 400;
        throw err;
      }
    }
  }

  return dbQuery;
};

// ─────────────────────────────────────────────
// CORE SERVICE EXPORTS 
// ─────────────────────────────────────────────

export const createPost = async (postData, userId) => {
  const { title, description, price, categoryId, attributes = {}, images, location } = postData;

  // 1. Core Fields Sanity validation (Basic explicit blocks)
  const normTitle = (title || "").trim();
  const normDescription = (description || "").trim();
  const normPrice = Number(price);

  if (!normTitle || !normDescription) {
    const err = new Error("Title and description are required.");
    err.statusCode = 400;
    throw err;
  }
  
  if (isNaN(normPrice) || normPrice < 0) {
    const err = new Error("Price must be a valid non-negative number.");
    err.statusCode = 400;
    throw err;
  }

  // 2. Resolve Category & Validate Leaf Node optimizations
  const category = await Category.findById(categoryId).lean();
  if (!category || category.isDeleted) {
    const err = new Error("Selected category is invalid or deleted.");
    err.statusCode = 404;
    throw err;
  }

  const hasChildren = await Category.exists({ parentId: categoryId, isDeleted: false });
  if (hasChildren) {
    const err = new Error("You can only post in final (leaf) categories.");
    err.statusCode = 400;
    throw err;
  }

  // 3. Strict Attribute Sanitization
  const validAttributes = validateAndNormalizeAttributes(category.attributes || [], attributes);

  // 4. Resolve Context Hierarchy
  const categoryPath = await getCategoryPath(categoryId);

  // 5. Instantiation Persistence
  const post = await Post.create({
    title: normTitle,
    description: normDescription,
    price: normPrice,
    categoryId,
    categoryPath,
    attributes: validAttributes,
    images: images || [],
    location: location || {},
    userId,
    isActive: true,
  });

  return post;
};


export const getPosts = async (queryParams) => {
  const page = Math.max(Number(queryParams.page) || 1, 1);
  const limit = Math.max(Number(queryParams.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // Lookup base category strictly when dealing with explicit attribute bindings to sanitize filter vectors natively
  let category = null;
  if (queryParams.categorySlug) {
    category = await Category.findOne({ slug: queryParams.categorySlug })
      .select("attributes name slug _id")
      .lean();
    if (category) {
      queryParams.categoryId = category._id.toString();
    }
  } else if (queryParams.categoryId) {
    category = await Category.findById(queryParams.categoryId)
      .select("attributes name slug")
      .lean();
  }

  // Build validated queries natively mapped
  const dbQuery = buildFilterQuery(queryParams, category);
  const sortQuery = buildSortQuery(queryParams.sort);

  const [posts, total] = await Promise.all([
    Post.find(dbQuery)
      .populate("categoryId", "name slug icon")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(dbQuery)
  ]);

  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};
