import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
    },
    icon: {
      // Lucide React icon name (e.g. "Car", "Bike"). Frontend renders dynamically.
      type: String,
      default: "Tag",
      trim: true,
    },
    order: {
      // Controls display order within a parent. Lower = earlier.
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      // Soft delete safety for Phase 2+. Do not hard-delete categories.
      type: Boolean,
      default: false,
    },
    attributes: [
      {
        key: {
          type: String,
          required: true,
          trim: true,
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["text", "number", "select", "radio", "checkbox", "boolean"],
          required: true,
        },
        options: {
          type: [String], // Only relevant for select/radio/checkbox
          default: [],
        },
        required: {
          type: Boolean,
          default: false,
        },
        filterable: {
          type: Boolean,
          default: false,
        },
      },
    ],
    country: {
      type: String,
      required: [true, "Country code is required"],
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    clickedBy: {
      type: [String], // Store User IDs or IPs to prevent duplicate counting
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
categorySchema.index({ slug: 1, country: 1 }, { unique: true });
categorySchema.index({ country: 1, parentId: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, isDeleted: 1 }); // compound for tree queries

const Category = mongoose.model("Category", categorySchema);

export default Category;
