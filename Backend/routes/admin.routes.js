import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllVendors,
  getAllProducts,
  getAllOrders,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyJWT, isAdmin);

// Dashboard stats
router.route("/stats").get(getDashboardStats);

// User management routes
router.route("/users").get(getAllUsers).post(createUser);
router.route("/users/:userId").get(getUserById).put(updateUser).delete(deleteUser);

// Vendor management routes
router.route("/vendors").get(getAllVendors);

// Product management routes
router.route("/products").get(getAllProducts);

// Order management routes
router.route("/orders").get(getAllOrders);

export default router;
