import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, RentalDuration } from '@/types/rental';
import { addDays, addHours, addWeeks } from 'date-fns';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, duration: RentalDuration, startDate: Date) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

const calculateEndDate = (startDate: Date, duration: RentalDuration): Date => {
  switch (duration) {
    case 'hourly':
      return addHours(startDate, 1);
    case 'daily':
      return addDays(startDate, 1);
    case 'weekly':
      return addWeeks(startDate, 1);
    default:
      return addDays(startDate, 1);
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
      
      addItem: (product, quantity, duration, startDate) => {
        const endDate = calculateEndDate(startDate, duration);
        const totalPrice = calculatePrice(product, duration, quantity);
        
        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          rentalDuration: duration,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalPrice,
        };
        
        set((state) => ({ items: [...state.items, newItem] }));
      },
      
      removeItem: (itemId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== itemId) }));
      },
      
      updateItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: 'rental-cart',
    }
  )
);
