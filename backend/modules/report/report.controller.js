import Report from "./report.model.js";

// @desc    Submit a report for a post
// @route   POST /api/reports
// @access  Private
export const submitReport = async (req, res) => {
  try {
    const { postId, reason, description } = req.body;
    const reporterId = req.user._id;
    const country = req.country; // injected by countryGateway middleware

    if (!postId || !reason) {
      return res.status(400).json({ message: "Post ID and reason are required." });
    }

    // Check if this user already reported this post
    const existing = await Report.findOne({ postId, reporterId });
    if (existing) {
      return res.status(409).json({ message: "You have already reported this listing." });
    }

    const report = await Report.create({
      postId,
      reporterId,
      reason,
      description: description || "",
      country,
    });

    res.status(201).json({ message: "Report submitted. Thank you for helping keep the platform safe.", reportId: report._id });
  } catch (error) {
    console.error("Error in submitReport:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
