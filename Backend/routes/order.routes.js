import express from "express";
import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  generateInvoicePDF,
  getOrderDetails,
  getUserOrders,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// User order routes
router.route("/").post(createOrder).get(getUserOrders);
router.route("/razorpay/create-order").post(createRazorpayOrder);
router.route("/razorpay/verify").post(verifyPayment);
router.route("/:orderId").get(getOrderDetails);
router.route("/:orderId/invoice/pdf").get(generateInvoicePDF);

export default router;
