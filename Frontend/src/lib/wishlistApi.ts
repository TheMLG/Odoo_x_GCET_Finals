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
  try {
    const response = await api.get<WishlistResponse>('/wishlist');
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (productId: string): Promise<void> => {
  if (!productId || typeof productId !== 'string') {
    throw new Error('Invalid product ID');
  }
  
  try {
    await api.post('/wishlist/items', { productId });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (productId: string): Promise<void> => {
  if (!productId || typeof productId !== 'string') {
    throw new Error('Invalid product ID');
  }
  
  try {
    await api.delete(`/wishlist/items/${productId}`);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Clear entire wishlist (remove all items)
 */
export const clearWishlist = async (): Promise<void> => {
  try {
    await api.delete('/wishlist/clear');
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

/**
 * Delete entire wishlist entity
 */
export const deleteWishlist = async (): Promise<void> => {
  try {
    await api.delete('/wishlist');
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    throw error;
  }
};

/**
 * Check if product is in wishlist
 */
export const checkInWishlist = async (productId: string): Promise<boolean> => {
  if (!productId || typeof productId !== 'string') {
    return false;
  }
  
  try {
    const response = await api.get<WishlistCheckResponse>(`/wishlist/check/${productId}`);
    return response.data.data.isInWishlist;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};
