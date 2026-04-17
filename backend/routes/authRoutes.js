import express from "express";
import { registerUser, verifyOtp, refreshToken, logoutUser, loginUser, forgotPassword, verifyResetOtp, resetPassword, googleAuthCallback, registerGoogleUser } from "../controllers/authController.js";
import passport from "passport";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL + "/registration_login", session: false }),
  googleAuthCallback
);

router.post("/google-register", registerGoogleUser);

export default router;
