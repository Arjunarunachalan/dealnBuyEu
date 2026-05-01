import User from "../../models/User.js";
import Post from "../post/Post.model.js";
import Report from "../report/report.model.js";
import { decryptField } from "../../utils/fieldEncryption.js";
import { SUPPORTED_COUNTRIES } from "../../config/countryConfig.js";

// ─────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const country = req.country;
    const countryName = SUPPORTED_COUNTRIES[country]?.name || country;
    const isSuperAdmin = req.user?.role === "super_admin";
    const userQuery = isSuperAdmin ? { isDeleted: { $ne: true } } : { country: countryName, isDeleted: { $ne: true } };
    const postQuery = isSuperAdmin ? { isActive: true } : { country, isActive: true };
    const reportQuery = isSuperAdmin ? {} : { country };

    const [totalUsers, totalPosts, totalReports] = await Promise.all([
      User.countDocuments(userQuery),
      Post.countDocuments(postQuery),
      Report.countDocuments(reportQuery),
    ]);

    return res.status(200).json({
      success: true,
      data: { totalUsers, totalPosts, totalReports, totalRevenue: 0 },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch stats." });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/users?page=1&limit=20&search=xxx
// ─────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const country = req.country;
    const countryName = SUPPORTED_COUNTRIES[country]?.name || country;
    const isSuperAdmin = req.user?.role === "super_admin";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    // Super admins see ALL users; regular admins are scoped to their country (stored as name, e.g., 'France')
    const baseQuery = isSuperAdmin ? {} : { country: countryName };
    const query = { ...baseQuery };

    if (search) {
      // In a real app we'd search encrypted fields with exact match or separate indexing,
      // but assuming the frontend might search by unencrypted name/pseudoName for Google users
      // Note: searching encrypted fields with $regex won't work. We'll leave it as is for role/authProvider or just fetch all and filter if needed.
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name surname pseudoName email role isActive createdAt authProvider country")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const decryptedUsers = users.map((u) => ({
      _id: u._id,
      name: safeDecrypt(u.name),
      surname: safeDecrypt(u.surname),
      pseudoName: safeDecrypt(u.pseudoName),
      email: safeDecrypt(u.email),
      role: u.role,
      isActive: u.isActive,
      authProvider: u.authProvider,
      country: u.country,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: decryptedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch users." });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/reports?page=1&limit=20&status=pending
// ─────────────────────────────────────────────
export const getReports = async (req, res) => {
  try {
    const country = req.country;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status; // optional: 'pending' | 'reviewed' | 'dismissed'

    const query = { country };
    if (statusFilter && ["pending", "reviewed", "dismissed"].includes(statusFilter)) {
      query.status = statusFilter;
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("postId", "title price images")
        .populate("reporterId", "name pseudoName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    // Decrypt reporter fields
    const formatted = reports.map((r) => ({
      ...r,
      reporter: r.reporterId
        ? {
            _id: r.reporterId._id,
            name: safeDecrypt(r.reporterId.name),
            pseudoName: safeDecrypt(r.reporterId.pseudoName),
            email: safeDecrypt(r.reporterId.email),
          }
        : null,
      reporterId: undefined,
    }));

    return res.status(200).json({
      success: true,
      data: {
        reports: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch reports." });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/reports/:id  — update status
// ─────────────────────────────────────────────
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewed", "dismissed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: "Report not found." });

    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to update report." });
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
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(", ")}.` });
    }

    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: "You cannot change your own role." });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true, select: "_id role" });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.status(200).json({ success: true, data: { _id: user._id, role: user.role } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to change user role." });
  }
};

// ─── Internal helper ────────────────────────────────────────────────────────
const safeDecrypt = (value) => {
  if (!value) return "";
  try { return decryptField(value); } catch { return value; }
};
