import { Router } from "express";
import {
  registerUser,
  registerVendor,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register/user").post(registerUser);
router.route("/register/vendor").post(registerVendor);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Password Reset
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

export default router;
