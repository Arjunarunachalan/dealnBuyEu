import mongoose from "mongoose";

const LegalPageSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  points: {
    type: [String],
    default: [],
  },
});

const LegalPageSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      enum: ["privacy", "terms", "cookies"],
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    sections: {
      type: [LegalPageSectionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const LegalPage = mongoose.models.LegalPage || mongoose.model("LegalPage", LegalPageSchema);

export default LegalPage;
