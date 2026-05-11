import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ad title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    url: {
      type: String,
      required: [true, "Redirection URL is required"],
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
    },
    city: {
      type: String,
      required: [true, "City name is required"],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    radius: {
      type: Number,
      default: 10,
    },
    placement: {
      type: String,
      enum: ["homepage", "category"],
      required: true,
    },
    targetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    target_impressions: {
      type: Number,
      required: true,
    },
    delivered_impressions: {
      type: Number,
      default: 0,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Indexes for fast filtering and geospatial queries
adSchema.index({ country: 1, active: 1, placement: 1 });
adSchema.index({ advertiser: 1 });
adSchema.index({ location: "2dsphere" });

const Ad = mongoose.model("Ad", adSchema);

export default Ad;
