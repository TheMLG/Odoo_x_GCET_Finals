import express from "express";
import { getAllProducts, createRentalProduct } from "../controllers/product.controller.js";
import { verifyVendor } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);

// Vendor routes
router.post("/", verifyVendor, createRentalProduct);

export default router;
