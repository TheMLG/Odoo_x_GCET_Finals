import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    getProductReviews, 
    addReview, 
    updateReview, 
    deleteReview,
    getTopReviews
} from "../controllers/review.controller.js";

const router = express.Router();

// Public routes
router.get("/top", getTopReviews);
router.get("/:productId", getProductReviews);

// Protected routes - Require authentication
router.post("/:productId", verifyJWT, addReview);
router.put("/:reviewId", verifyJWT, updateReview);
router.delete("/:reviewId", verifyJWT, deleteReview);

export default router;
