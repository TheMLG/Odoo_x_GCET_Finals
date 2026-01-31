import { Router } from "express";
import {
    getAvailableCoupons,
    validateCoupon,
    applyCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

// Public routes - anyone can view and validate coupons
router.route("/available").get(getAvailableCoupons);
router.route("/validate").post(validateCoupon);
router.route("/apply").post(applyCoupon);

export default router;
