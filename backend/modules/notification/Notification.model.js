import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    type: {
      type: String,
      enum: ["system", "admin", "promo"],
      default: "admin",
    },
    targetAudience: {
      type: String,
      enum: ["all", "premium", "specific"],
      default: "all",
    },
    country: {
      type: String, // Which country this was broadcasted to
    },
    targetUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    clearedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient querying by users (e.g. all targeted to them + globally broadcasted)
notificationSchema.index({ targetAudience: 1, country: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
