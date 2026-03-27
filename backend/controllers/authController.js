import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { encryptField, decryptField } from "../utils/fieldEncryption.js";
import { sendMail } from "../utils/mailer.js";
import { getOtpEmailHtml } from "../templates/otpEmail.js";
import jwt from "jsonwebtoken";

// Cookie config for refresh token
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, country, authProvider } = req.body;

    // Encrypt email for DB lookup (deterministic so findOne works)
    const encryptedEmail = encryptField(email);

    const userExists = await User.findOne({ email: encryptedEmail });

    if (userExists) {
      if (userExists.authProvider === "google" && (!authProvider || authProvider === "local")) {
        return res.status(400).json({ message: "Email registered via Google. Please use Google Login." });
      }
      if (userExists.isVerified) {
        return res.status(400).json({ message: "User already registered and verified." });
      }

      // Resend OTP for unverified user
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.otp = otp;
      userExists.otpExpires = Date.now() + 10 * 60 * 1000;
      await userExists.save();

      // Send OTP email (non-blocking, don't hold up the response)
      sendMail({
        to: email,
        subject: "Your DealNBuy Verification Code",
        html: getOtpEmailHtml(otp, username),
      }).catch(err => console.error("OTP email resend failed:", err.message));

      return res.status(200).json({ message: "OTP resent to your email", email });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Encrypt sensitive fields before storing in DB (GDPR)
    const user = await User.create({
      username: encryptField(username),
      email: encryptedEmail,
      password,
      country,
      authProvider: authProvider || "local",
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false,
    });

    if (user) {
      // Send OTP email (non-blocking)
      sendMail({
        to: email,
        subject: "Welcome to DealNBuy – Verify Your Email",
        html: getOtpEmailHtml(otp, username),
      }).catch(err => console.error("OTP email failed:", err.message));

      res.status(201).json({ message: "Account created! Please check your email for the OTP.", email });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and generate tokens
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const encryptedEmail = encryptField(email);
    const user = await User.findOne({ email: encryptedEmail });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);

    user.refreshToken = refreshTokenValue;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshTokenValue, COOKIE_OPTIONS);

    // Send plain JSON (decrypt fields from DB before sending)
    res.status(200).json({
      _id: user._id,
      username: decryptField(user.username),
      email: email,
      accessToken,
      message: "Verification successful",
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh Token (reads from cookie)
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) return res.status(401).json({ message: "Not authorized, no refresh token" });

    const user = await User.findOne({ refreshToken: token });

    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");

      const newAccessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      // Set new refresh token cookie
      res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

      res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
      return res.status(403).json({ message: "Refresh token expired" });
    }
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout (clear refresh token)
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const encryptedEmail = encryptField(email);
    const user = await User.findOne({ email: encryptedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({ message: "Account uses Google Login. Please use Google to sign in." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateModifiedOnly: true });

    // Send OTP email
    sendMail({
      to: email,
      subject: "DealNBuy – Password Reset Verification Code",
      html: getOtpEmailHtml(otp, decryptField(user.username) || "User"),
    }).catch(err => console.error("Forgot password OTP email failed:", err.message));

    return res.status(200).json({ message: "OTP sent to your email", email });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ message: "Failed to send reset OTP. Please try again." });
  }
};

// @desc    Verify Reset Password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const encryptedEmail = encryptField(email);
    const user = await User.findOne({ email: encryptedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify reset OTP error:", error.message);
    res.status(500).json({ message: "Failed to verify OTP." });
  }
};

// @desc    Reset Password & Auto Login
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const encryptedEmail = encryptField(email);
    const user = await User.findOne({ email: encryptedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password (User model pre-save hook handles hashing)
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;

    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);

    user.refreshToken = refreshTokenValue;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshTokenValue, COOKIE_OPTIONS);

    res.status(200).json({
      _id: user._id,
      username: decryptField(user.username),
      email: email,
      accessToken,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ message: "Failed to reset password." });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const encryptedEmail = encryptField(email);
    const user = await User.findOne({ email: encryptedEmail });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: "User not registered or verified. Please sign up." });
      }

      if (user.authProvider === "google") {
        return res.status(400).json({ message: "Please log in using Google." });
      }

      const accessToken = generateAccessToken(user._id);
      const refreshTokenValue = generateRefreshToken(user._id);

      user.refreshToken = refreshTokenValue;
      // skip validation during save because we only update token
      await user.save({ validateModifiedOnly: true });

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshTokenValue, COOKIE_OPTIONS);

      res.status(200).json({
        _id: user._id,
        username: decryptField(user.username),
        email: email,
        accessToken,
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
