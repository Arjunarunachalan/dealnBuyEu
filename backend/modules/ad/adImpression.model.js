import mongoose from "mongoose";

const adImpressionSchema = new mongoose.Schema(
  {
    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest users
    },
    sessionId: {
      type: String,
      required: true, // Used for tracking guest users or associating with a specific session
    },
    placement: {
      type: String,
      enum: ["homepage", "category"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // we get createdAt and updatedAt automatically
  }
);

// Indexes for billing/analytics aggregation
adImpressionSchema.index({ adId: 1, timestamp: -1 });

const AdImpression = mongoose.model("AdImpression", adImpressionSchema);

export default AdImpression;
