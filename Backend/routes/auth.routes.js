import { Router } from "express";
import {
  registerUser,
  registerVendor,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register/user").post(registerUser);
router.route("/register/vendor").post(registerVendor);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
