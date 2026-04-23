import LegalPage from "../models/LegalPage.js";

// @desc    Get a legal page by pageName
// @route   GET /api/legal-pages/:pageName
// @access  Public
export const getLegalPage = async (req, res) => {
  try {
    const { pageName } = req.params;
    const legalPage = await LegalPage.findOne({ pageName });

    if (!legalPage) {
      // Return empty default structure if not found
      return res.status(200).json({
        pageName,
        title: "",
        sections: [],
      });
    }

    res.status(200).json(legalPage);
  } catch (error) {
    console.error("Error fetching legal page:", error);
    res.status(500).json({ message: "Server error fetching legal page" });
  }
};

// @desc    Update or create a legal page
// @route   PUT /api/legal-pages/:pageName
// @access  Private/Admin
export const updateLegalPage = async (req, res) => {
  try {
    const { pageName } = req.params;
    const { title, sections } = req.body;

    // Verify it's a valid pageName
    if (!["privacy", "terms", "cookies"].includes(pageName)) {
      return res.status(400).json({ message: "Invalid page name" });
    }

    const updatedPage = await LegalPage.findOneAndUpdate(
      { pageName },
      { title, sections },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("Error updating legal page:", error);
    res.status(500).json({ message: "Server error updating legal page" });
  }
};
