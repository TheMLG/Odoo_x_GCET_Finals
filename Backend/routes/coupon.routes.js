import { Router } from "express";
import {
    getAvailableCoupons,
    validateCoupon,
    applyCoupon,
} from "../controllers/coupon.controller.js";
import { verifyJWT, optionalJWT } from "../middleware/auth.middleware.js";

const router = Router();

// GET /available - works with or without auth (shows global + user-specific coupons if authenticated)
router.route("/available").get(optionalJWT, getAvailableCoupons);

// POST /validate and /apply - require authentication
router.route("/validate").post(verifyJWT, validateCoupon);
router.route("/apply").post(verifyJWT, applyCoupon);

export default router;
