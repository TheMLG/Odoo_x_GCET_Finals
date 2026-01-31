import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, RentalDuration } from '@/types/rental';
import { addDays, addHours, addWeeks } from 'date-fns';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (product: Product, quantity: number, duration: RentalDuration, startDate: Date) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalAmount: () => number;
}

const calculateEndDate = (startDate: Date, duration: RentalDuration): Date => {
  // Ensure startDate is a Date object
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  
  switch (duration) {
    case 'hourly':
      return addHours(start, 1);
    case 'daily':
      return addDays(start, 1);
    case 'weekly':
      return addWeeks(start, 1);
    default:
      return addDays(start, 1);
  }
};

const calculatePrice = (product: Product, duration: RentalDuration, quantity: number): number => {
  let basePrice = 0;
  switch (duration) {
    case 'hourly':
      basePrice = product.pricePerHour;
      break;
    case 'daily':
      basePrice = product.pricePerDay;
      break;
    case 'weekly':
      basePrice = product.pricePerWeek;
      break;
    default:
      basePrice = product.pricePerDay;
  }
  return basePrice * quantity;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const response = await api.get('/cart');
          const cartData = response.data.data;
          
          if (!cartData || !cartData.items) {
            set({ items: [], isLoading: false });
            return;
          }
          
          // Transform backend cart items to frontend format
          const transformedItems: CartItem[] = cartData.items.map((item: any) => {
            const pricing = item.product?.pricing || {};
            const inventory = item.product?.inventory || {};
            
            return {
              id: item.id,
              productId: item.productId,
              product: {
                id: item.product.id,
                name: item.product.name,
                description: item.product.description || '',
                category: item.product.category || 'General',
                images: item.product.product_image_url ? [item.product.product_image_url] : [],
                isRentable: true,
                isPublished: item.product.isPublished ?? false,
                costPrice: 0,
                pricePerHour: Number(pricing.pricePerHour) || 0,
                pricePerDay: Number(pricing.pricePerDay) || 0,
                pricePerWeek: Number(pricing.pricePerWeek) || 0,
                quantityOnHand: inventory.quantityOnHand || 0,
                vendorId: item.product.vendorId,
                attributes: typeof item.product.attributes === 'object' && !Array.isArray(item.product.attributes) 
                  ? item.product.attributes 
                  : {},
                createdAt: item.product.createdAt,
              },
              quantity: item.quantity,
              rentalDuration: 'daily', // Default, can be enhanced
              startDate: item.rentalStart,
              endDate: item.rentalEnd,
              totalPrice: parseFloat(item.unitPrice) * item.quantity,
            };
          });
          
          set({ items: transformedItems, isLoading: false });
        } catch (error: any) {
          console.error('Failed to fetch cart:', error);
          set({ items: [], isLoading: false });
        }
      },
      
      addItem: async (product, quantity, duration, startDate) => {
        try {
          set({ isLoading: true });
          
          // Ensure startDate is a Date object (handle string from localStorage)
          const deliveryDate = startDate instanceof Date ? startDate : new Date(startDate);
          const endDate = calculateEndDate(deliveryDate, duration);
          const unitPrice = calculatePrice(product, duration, 1);
          
          const payload = {
            productId: product.id,
            quantity,
            rentalStart: deliveryDate.toISOString(),
            rentalEnd: endDate.toISOString(),
            unitPrice: unitPrice,
          };
          
          console.log('Adding to cart with payload:', payload);
          
          await api.post('/cart/items', payload);
          
          // Refresh cart after adding
          await get().fetchCart();
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Add to cart error:', error.response?.data || error);
          toast.error('Failed to add to cart', {
            description: error.response?.data?.message || 'Something went wrong'
          });
          throw error;
        }
      },
      
      removeItem: async (itemId) => {
        try {
          set({ isLoading: true });
          await api.delete(`/cart/items/${itemId}`);
          
          // Update local state
          set((state) => ({ 
            items: state.items.filter((item) => item.id !== itemId),
            isLoading: false 
          }));
        } catch (error: any) {
          set({ isLoading: false });
          toast.error('Failed to remove item', {
            description: error.response?.data?.message || 'Something went wrong'
          });
        }
      },
      
      updateItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      },
      
      clearCart: async () => {
        try {
          set({ isLoading: true });
          await api.delete('/cart');
          set({ items: [], isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          toast.error('Failed to clear cart', {
            description: error.response?.data?.message || 'Something went wrong'
          });
        }
      },
      
      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: 'rental-cart',
      partialize: (state) => ({ 
        // Don't persist cart items - always fetch from API
        // Only persist non-critical state if needed
      }),
    }
  )
);
