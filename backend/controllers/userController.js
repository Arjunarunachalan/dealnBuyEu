import User from "../models/User.js";
import { encryptField, decryptField } from "../utils/fieldEncryption.js";

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Re-encrypt values that need to be stored securely. 
      // If the field isn't present in the req, retain the previous value.
      user.name = req.body.name ? encryptField(req.body.name) : user.name;
      
      // Decrypt field before checking/comparing if needed, but since we are replacing it,
      // we only need to pass the incoming plaintext through encryptField.
      if (req.body.surname) user.surname = encryptField(req.body.surname);
      if (req.body.pseudoName) user.pseudoName = encryptField(req.body.pseudoName);
      
      // Additional fields
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.location !== undefined) user.location = req.body.location;

      const updatedUser = await user.save();

      // Return a decrypted payload back to the client to update their store seamlessly
      res.json({
        _id: updatedUser._id,
        name: decryptField(updatedUser.name),
        surname: decryptField(updatedUser.surname),
        pseudoName: decryptField(updatedUser.pseudoName),
        email: decryptField(updatedUser.email) || updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        country: updatedUser.country,
        role: updatedUser.role,
        gdprAccepted: updatedUser.gdprAccepted,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Server Error updating profile." });
  }
};
