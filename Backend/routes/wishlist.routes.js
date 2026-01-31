import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  deleteWishlist,
  checkInWishlist
} from '../controllers/wishlist.controller.js';

const router = Router();

// All wishlist routes require authentication
router.use(verifyJWT);

// Check if product is in wishlist (must be before GET /)
router.get('/check/:productId', checkInWishlist);

// Clear entire wishlist (remove all items but keep wishlist) - must be before DELETE /
router.delete('/clear', clearWishlist);

// Add product to wishlist
router.post('/items', addToWishlist);

// Remove product from wishlist
router.delete('/items/:productId', removeFromWishlist);

// Get user's wishlist
router.get('/', getWishlist);

// Delete entire wishlist entity (must be last among root DELETE routes)
router.delete('/', deleteWishlist);

export default router;
