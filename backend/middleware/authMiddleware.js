import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * protect
 * Verifies the Bearer access token, fetches the user (lean),
 * and attaches them to req.user. Returns 401 on failure.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "access_secret"
    );

    // Attach lean user (no password, no refresh token)
    const user = await User.findById(decoded.id)
      .select("-password -refreshToken -otp -otpExpires")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or expired.",
    });
  }
};

/**
 * adminOnly
 * Must run AFTER protect.
 * Allows role = "admin" or "super_admin".
 */
export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "super_admin")) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin privileges required.",
  });
};

/**
 * superAdminOnly
 * Must run AFTER protect.
 * Allows role = "super_admin" only.
 */
export const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "super_admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Super admin privileges required.",
  });
};
