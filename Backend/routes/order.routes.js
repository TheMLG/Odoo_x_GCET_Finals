import express from "express";
import {
  createOrder,
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
router.route("/:orderId").get(getOrderDetails);
router.route("/:orderId/invoice/pdf").get(generateInvoicePDF);

export default router;
