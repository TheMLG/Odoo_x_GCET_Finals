import { create } from 'zustand';
import { Product } from '@/types/rental';
import * as wishlistApi from '@/lib/wishlistApi';
import { toast } from 'sonner';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  addItem: (product: Product) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  deleteWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  fetchWishlist: async () => {
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true, error: null });
    
    try {
      const items = await wishlistApi.getWishlist();
      set({ 
        items: items || [], 
        isInitialized: true, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      console.error('Failed to fetch wishlist:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load wishlist';
      
      // If user is not authenticated, clear the wishlist
      if (error.response?.status === 401) {
        set({ items: [], isInitialized: false, isLoading: false, error: 'Please login to view wishlist' });
      } else {
        set({ items: [], isLoading: false, error: errorMessage });
      }
    }
  },

  addItem: async (product: Product): Promise<boolean> => {
    const { items, isInWishlist } = get();
    
    // Check if already in wishlist
    if (isInWishlist(product.id)) {
      toast.info('Product already in wishlist');
      return false;
    }

    // Validate product
    if (!product || !product.id) {
      toast.error('Invalid product');
      return false;
    }

    // Optimistically update UI
    const newItems = [...items, product];
    set({ items: newItems, error: null });

    try {
      await wishlistApi.addToWishlist(product.id);
      return true;
    } catch (error: any) {
      // Revert on error
      set({ items, error: error.response?.data?.message || 'Failed to add to wishlist' });
      console.error('Failed to add to wishlist:', error);
      
      const statusCode = error.response?.status;
      
      // If user is not authenticated, require login
      if (statusCode === 401) {
        toast.error('Please login to add items to wishlist');
      } else if (statusCode === 404) {
        toast.error('Product not found');
      } else {
        toast.error('Failed to add to wishlist');
      }
      return false;
    }
  },

  removeItem: async (productId: string): Promise<boolean> => {
    const { items } = get();
    
    if (!productId) {
      toast.error('Invalid product ID');
      return false;
    }

    // Optimistically update UI
    const newItems = items.filter((item) => item.id !== productId);
    set({ items: newItems, error: null });

    try {
      await wishlistApi.removeFromWishlist(productId);
      return true;
    } catch (error: any) {
      console.error('Failed to remove from wishlist:', error);
      
      const statusCode = error.response?.status;
      
      // Always revert on error - no local fallback
      set({ items, error: error.response?.data?.message || 'Failed to remove from wishlist' });
      
      if (statusCode === 401) {
        toast.error('Please login to manage wishlist');
      } else if (statusCode === 404) {
        // Item not found in database, keep the UI updated
        set({ items: newItems, error: null });
        return true;
      } else {
        toast.error('Failed to remove from wishlist');
      }
      return false;
    }
  },

  isInWishlist: (productId: string) => {
    const { items } = get();
    return items.some((item) => item.id === productId);
  },

  clearWishlist: async () => {
    const { items } = get();
    
    // Optimistically update UI
    set({ items: [], error: null });

    try {
      await wishlistApi.clearWishlist();
    } catch (error: any) {
      console.error('Failed to clear wishlist:', error);
      
      // Revert on error
      set({ items, error: error.response?.data?.message || 'Failed to clear wishlist' });
      
      if (error.response?.status === 401) {
        toast.error('Please login to clear wishlist');
      } else {
        toast.error('Failed to clear wishlist');
      }
    }
  },

  deleteWishlist: async () => {
    const { items } = get();
    
    // Optimistically update UI
    set({ items: [], isInitialized: false, error: null });

    try {
      await wishlistApi.deleteWishlist();
    } catch (error: any) {
      console.error('Failed to delete wishlist:', error);
      
      // Revert on error
      set({ items, isInitialized: true, error: error.response?.data?.message || 'Failed to delete wishlist' });
      
      if (error.response?.status === 401) {
        toast.error('Please login to delete wishlist');
      } else {
        toast.error('Failed to delete wishlist');
      }
    }
  },
}));
