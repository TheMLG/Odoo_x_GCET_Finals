import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(verifyJWT);

// Cart routes
router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeFromCart);
router.delete("/", clearCart);

export default router;
