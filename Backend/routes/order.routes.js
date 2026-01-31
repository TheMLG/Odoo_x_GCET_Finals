import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// POST /api/v1/orders - Create order(s) from cart
router.post("/", createOrder);

// GET /api/v1/orders - Get all orders for the authenticated user
// Query params: status (optional) - CONFIRMED, INVOICED, RETURNED, CANCELLED
router.get("/", getUserOrders);

// GET /api/v1/orders/:orderId - Get single order details
router.get("/:orderId", getOrderById);

export default router;
