import api from './api';
import { Product } from '@/types/rental';

export interface WishlistResponse {
  success: boolean;
  data: Product[];
  message: string;
}

export interface WishlistCheckResponse {
  success: boolean;
  data: { isInWishlist: boolean };
  message: string;
}

/**
 * Get user's wishlist
 */
export const getWishlist = async (): Promise<Product[]> => {
  const response = await api.get<WishlistResponse>('/wishlist');
  return response.data.data;
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (productId: string): Promise<void> => {
  await api.post('/wishlist/items', { productId });
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (productId: string): Promise<void> => {
  await api.delete(`/wishlist/items/${productId}`);
};

/**
 * Clear entire wishlist (remove all items)
 */
export const clearWishlist = async (): Promise<void> => {
  await api.delete('/wishlist/clear');
};

/**
 * Delete entire wishlist entity
 */
export const deleteWishlist = async (): Promise<void> => {
  await api.delete('/wishlist');
};

/**
 * Check if product is in wishlist
 */
export const checkInWishlist = async (productId: string): Promise<boolean> => {
  const response = await api.get<WishlistCheckResponse>(`/wishlist/check/${productId}`);
  return response.data.data.isInWishlist;
};
