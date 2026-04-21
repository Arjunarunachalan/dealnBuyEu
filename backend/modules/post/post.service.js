import Post from "./Post.model.js";
import Category from "../category/Category.model.js";
import { getCategoryPath } from "../category/category.service.js";
import { decryptField } from "../../utils/fieldEncryption.js";
import cloudinary from "../../utils/cloudinary.js";

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
  const { categoryId, categorySlug, minPrice, maxPrice, country, lat, lng, ...dynamicParams } = queryParams;
  const dbQuery = { isActive: true };

  // Explicit Strict Country Enforcement
  if (country) {
    dbQuery.country = country;
  } else {
    throw new Error("Strict architecture error: country is required for queries.");
  }

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

  // Handle GeoSpatial 2dsphere nearest constraints natively
  if (lat !== undefined && lng !== undefined) {
    dbQuery["location.geo"] = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)] // GeoJSON expects [longitude, latitude]
        }
      }
    };
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
  const { title, description, price, categoryId, attributes = {}, images, location, country } = postData;

  if (!country) {
    throw new Error("Strict architecture error: country is required for creation.");
  }

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

  // 4b. Cloudinary Image Uploads
  let uploadedImages = [];
  if (images && images.length > 0) {
    const uploadPromises = images.map(async (base64Img) => {
      // Direct base64 string upload to Cloudinary
      try {
        const result = await cloudinary.uploader.upload(base64Img, {
          folder: 'dealnBuyEu/posts',
        });
        return result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        throw new Error("Failed to upload image to the cloud.");
      }
    });
    // Upload concurrently
    uploadedImages = await Promise.all(uploadPromises);
  }

  // 5. Instantiation Persistence
  const post = await Post.create({
    title: normTitle,
    description: normDescription,
    price: normPrice,
    categoryId,
    categoryPath,
    attributes: validAttributes,
    images: uploadedImages,
    location: location || {},
    userId,
    isActive: true,
    country,
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
      .select("attributes name slug _id parentId")
      .lean();
    if (category) {
      queryParams.categoryId = category._id.toString();
    }
  } else if (queryParams.categoryId) {
    category = await Category.findById(queryParams.categoryId)
      .select("attributes name slug parentId")
      .lean();
  }

  // If the matched category has no attributes (i.e. it's a parent), aggregate
  // attributes from all descendant children so filters can validate correctly.
  if (category && (!category.attributes || category.attributes.length === 0)) {
    const descendants = await Category.find({
      parentId: category._id,
      isDeleted: false,
    }).select("attributes").lean();

    // Recursively collect attributes from all levels of descendants
    const collectAllDescendants = async (parentId) => {
      const children = await Category.find({ parentId, isDeleted: false }).select("attributes _id").lean();
      let allAttrs = [];
      for (const child of children) {
        if (child.attributes?.length > 0) allAttrs.push(...child.attributes);
        const deeper = await collectAllDescendants(child._id);
        allAttrs.push(...deeper);
      }
      return allAttrs;
    };

    const allDescendantAttrs = await collectAllDescendants(category._id);

    // Merge attributes by key (deduplicate, union options)
    const attrsMap = new Map();
    for (const attr of allDescendantAttrs) {
      if (!attrsMap.has(attr.key)) {
        attrsMap.set(attr.key, { ...attr });
      } else {
        const existing = attrsMap.get(attr.key);
        if (existing.options && attr.options) {
          existing.options = Array.from(new Set([...existing.options, ...attr.options]));
        }
      }
    }
    category.attributes = Array.from(attrsMap.values());
  }

  // Build validated queries natively mapped
  const dbQuery = buildFilterQuery(queryParams, category);
  
  // Natively, if $near is queried, MongoDB inherently sorts ascending by distance.
  // We must skip standard default overriding sorting or it will throw a conflict error, unless user explicitly specifies a sort query.
  const sortQuery = (queryParams.lat && queryParams.lng && !queryParams.sort) 
    ? undefined 
    : buildSortQuery(queryParams.sort);

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

export const getPostById = async (id, country) => {
  if (!country) {
    throw new Error("Strict architecture error: country context is required.");
  }

  const post = await Post.findOne({ _id: id, country, isActive: true })
    .populate("categoryId", "name slug icon")
    .populate("userId", "name surname pseudoName createdAt country avatar productsCount") // Safety populate
    .lean();

  if (!post) {
    const err = new Error("Post not found or unavailable in this region.");
    err.statusCode = 404;
    throw err;
  }

  // Populate dynamic product counts safely (just as a helper if needed later)
  post.sellerProductsCount = await Post.countDocuments({ userId: post.userId._id, isActive: true, country });

  if (post.userId) {
    const safeDecrypt = (value) => {
      if (!value) return "";
      try { return decryptField(value); } catch { return value; }
    };
    post.userId.name = safeDecrypt(post.userId.name);
    post.userId.surname = safeDecrypt(post.userId.surname);
    post.userId.pseudoName = safeDecrypt(post.userId.pseudoName);
  }

  return post;
};
