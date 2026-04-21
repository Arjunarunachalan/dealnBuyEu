import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category classification is required"],
    },
    categoryPath: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "Category",
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }, // [longitude, latitude]
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
      required: [true, "Country code is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ country: 1, isActive: 1 }); // Main querying index
postSchema.index({ "location.geo": "2dsphere" }); // Geospatial indexing for rigorous radial scale
postSchema.index({ categoryPath: 1 });
postSchema.index({ price: 1 });
postSchema.index({ userId: 1 });
postSchema.index({ isActive: 1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
