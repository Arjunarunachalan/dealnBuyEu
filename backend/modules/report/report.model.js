import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "prohibited_item",
        "counterfeit_goods",
        "scam_or_fraud",
        "stolen_property",
        "illegal_eu_law",
        "gdpr_violation",
        "hate_speech",
        "animal_products",
        "misleading_info",
        "duplicate_spam",
        "unsafe_product",
        "other",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    country: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One report per user per post (prevent spam)
reportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
