import express from "express";
import { protect, adminOnly } from "../../middleware/authMiddleware.js";
import {
  createCategoryHandler,
  getCategoriesHandler,
  updateCategoryHandler,
  toggleCategoryStatusHandler,
  updateCategoryAttributesHandler,
  getCategoryFiltersHandler,
  getPopularCategoriesHandler,
  incrementCategoryClickHandler,
} from "./category.controller.js";

// ─── Public routes (no auth required) ────────
const categoryPublicRouter = express.Router();

categoryPublicRouter.get("/popular", getPopularCategoriesHandler);
categoryPublicRouter.post("/slug/:slug/click", incrementCategoryClickHandler);
categoryPublicRouter.get("/", getCategoriesHandler);
categoryPublicRouter.get("/:id/filters", getCategoryFiltersHandler);

// ─── Admin routes (protect + adminOnly) ──────
const categoryAdminRouter = express.Router();

categoryAdminRouter.use(protect, adminOnly);

categoryAdminRouter.post("/", createCategoryHandler);
categoryAdminRouter.put("/:id", updateCategoryHandler);
categoryAdminRouter.patch("/:id/status", toggleCategoryStatusHandler);
categoryAdminRouter.put("/:id/attributes", updateCategoryAttributesHandler);

export { categoryPublicRouter, categoryAdminRouter };
