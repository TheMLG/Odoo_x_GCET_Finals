import express from "express";
import { getAllProducts, createRentalProduct, getProductById } from "../controllers/product.controller.js";
import { verifyVendor } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:productId", getProductById);

// Vendor routes
router.post("/", verifyVendor, createRentalProduct);

export default router;
