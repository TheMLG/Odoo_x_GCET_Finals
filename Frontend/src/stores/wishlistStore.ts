import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/rental';
import * as wishlistApi from '@/lib/wishlistApi';
import { toast } from 'sonner';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  isInitialized: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  deleteWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isInitialized: false,

      fetchWishlist: async () => {
        try {
          set({ isLoading: true });
          const items = await wishlistApi.getWishlist();
          set({ items, isInitialized: true, isLoading: false });
        } catch (error: any) {
          console.error('Failed to fetch wishlist:', error);
          // If user is not authenticated, just use local storage
          if (error.response?.status === 401) {
            set({ isInitialized: true, isLoading: false });
          } else {
            set({ isLoading: false });
            toast.error('Failed to load wishlist');
          }
        }
      },

      addItem: async (product: Product) => {
        const { items, isInWishlist } = get();
        
        if (isInWishlist(product.id)) {
          return;
        }

        // Optimistically update UI
        set({ items: [...items, product] });

        try {
          await wishlistApi.addToWishlist(product.id);
        } catch (error: any) {
          // Revert on error
          set({ items });
          console.error('Failed to add to wishlist:', error);
          
          // If user is not authenticated, keep it in local storage
          if (error.response?.status !== 401) {
            toast.error('Failed to add to wishlist');
          }
        }
      },

      removeItem: async (productId: string) => {
        const { items } = get();
        
        // Optimistically update UI
        const newItems = items.filter((item) => item.id !== productId);
        set({ items: newItems });

        try {
          await wishlistApi.removeFromWishlist(productId);
        } catch (error: any) {
          // Revert on error
          set({ items });
          console.error('Failed to remove from wishlist:', error);
          
          // If user is not authenticated, keep local change
          if (error.response?.status !== 401) {
            toast.error('Failed to remove from wishlist');
          }
        }
      },

      isInWishlist: (productId: string) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },

      clearWishlist: async () => {
        const { items } = get();
        
        // Optimistically update UI
        set({ items: [] });

        try {
          await wishlistApi.clearWishlist();
        } catch (error: any) {
          // Revert on error
          set({ items });
          console.error('Failed to clear wishlist:', error);
          
          // If user is not authenticated, keep local change
          if (error.response?.status !== 401) {
            toast.error('Failed to clear wishlist');
          }
        }
      },

      deleteWishlist: async () => {
        const { items } = get();
        
        // Optimistically update UI
        set({ items: [], isInitialized: false });

        try {
          await wishlistApi.deleteWishlist();
        } catch (error: any) {
          // Revert on error
          set({ items, isInitialized: true });
          console.error('Failed to delete wishlist:', error);
          
          // If user is not authenticated, keep local change
          if (error.response?.status !== 401) {
            toast.error('Failed to delete wishlist');
          }
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
