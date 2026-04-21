import User from "../../models/User.js";
import Post from "../post/Post.model.js";
import { decryptField } from "../../utils/fieldEncryption.js";

// ─────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const country = req.country; // Extracted by countryGateway!

    const [totalUsers, totalPosts] = await Promise.all([
      User.countDocuments({ country, isDeleted: { $ne: true } }),
      Post.countDocuments({ country, isActive: true }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Stats for ${country} fetched successfully.`,
      data: {
        totalUsers,
        totalPosts,
        totalRevenue: 0, // Placeholder for Phase 2 Payments
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch stats.",
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/users?page=1&limit=10
// ─────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const country = req.country;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ country })
        .select("name surname pseudoName email role isActive createdAt authProvider")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ country }),
    ]);


    // Decrypt GDPR-encrypted fields before sending
    const decryptedUsers = users.map((u) => ({
      _id: u._id,
      name: safeDecrypt(u.name),
      surname: safeDecrypt(u.surname),
      pseudoName: safeDecrypt(u.pseudoName),
      email: safeDecrypt(u.email),
      role: u.role,
      isActive: u.isActive,
      authProvider: u.authProvider,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: {
        users: decryptedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch users.",
    });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/users/:id/role  (superAdminOnly)
// ─────────────────────────────────────────────
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin", "super_admin"];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}.`,
      });
    }

    // Prevent changing own role
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: "_id role" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Role updated to "${role}" successfully.`,
      data: { _id: user._id, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to change user role.",
    });
  }
};

// ─── Internal helper ───────────────────────────────────────────────────────
/**
 * safeDecrypt — decrypts a field but returns the raw value if decryption fails.
 * This handles edge cases where data was stored unencrypted (e.g. Google auth users).
 */
const safeDecrypt = (value) => {
  if (!value) return "";
  try {
    return decryptField(value);
  } catch {
    return value; // return raw if it's not encrypted
  }
};
