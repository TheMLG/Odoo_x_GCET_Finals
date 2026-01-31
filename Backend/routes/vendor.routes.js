import { Router } from "express";
import {
  getVendorProfile,
  updateVendorProfile,
  getVendorProducts,
  getVendorOrders,
  updateOrderStatus,
  getVendorStats,
} from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isVendor } from "../middleware/role.middleware.js";

const router = Router();

// All vendor routes require authentication and vendor role
router.use(verifyJWT, isVendor);

// Vendor profile routes
router.route("/profile").get(getVendorProfile).put(updateVendorProfile);

// Vendor products routes
router.route("/products").get(getVendorProducts);

// Vendor orders routes
router.route("/orders").get(getVendorOrders);
router.route("/orders/:orderId/status").patch(updateOrderStatus);

// Vendor dashboard stats
router.route("/stats").get(getVendorStats);

export default router;
