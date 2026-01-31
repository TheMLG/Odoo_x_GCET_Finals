import { Router } from "express";
import {
    getAvailableCoupons,
    validateCoupon,
    applyCoupon,
} from "../controllers/coupon.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Protected routes - require authentication for user-specific coupons
router.route("/available").get(verifyJWT, getAvailableCoupons);
router.route("/validate").post(verifyJWT, validateCoupon);
router.route("/apply").post(verifyJWT, applyCoupon);

export default router;
