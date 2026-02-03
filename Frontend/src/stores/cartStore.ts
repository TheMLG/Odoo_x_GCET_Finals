import { create } from "zustand";

import api from "@/lib/api";
import { CartItem, Product, RentalDuration } from "@/types/rental";
import { addDays, addHours, addWeeks } from "date-fns";
import { toast } from "sonner";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  appliedCoupon: { code: string; discount: number } | null;
  addItem: (
    product: Product,
    quantity: number,
    duration: RentalDuration,
    startDate: Date,
    endDate?: Date,
    variantId?: string | null,
    selectedAttributes?: Record<string, string>,
    pricingOverride?: {
      pricePerHour?: number;
      pricePerDay?: number;
      pricePerWeek?: number;
    },
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalAmount: () => number;
  applyCoupon: (coupon: { code: string; discount: number }) => void;
  removeCoupon: () => void;
}

const calculateEndDate = (startDate: Date, duration: RentalDuration): Date => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  switch (duration) {
    case "hourly":
      return addHours(start, 1);
    case "daily":
      return addDays(start, 1);
    case "weekly":
      return addWeeks(start, 1);
    default:
      return addDays(start, 1);
  }
};

const GST_RATE = 0.18;

const calculateRentalCost = (
  product: Product,
  startDate: Date,
  endDate: Date,
  quantity: number,
) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

  let basePrice = 0;

  // Dynamic pricing strategy
  if (diffDays >= 30 && product.pricePerWeek) {
    // Monthly roughly (4 weeks) - fallback to weekly rate * 4 if no monthly rate
    // or pro-rata weekly
    basePrice = (diffDays / 7) * product.pricePerWeek;
  } else if (diffDays >= 7 && product.pricePerWeek) {
    basePrice = (diffDays / 7) * product.pricePerWeek;
  } else {
    basePrice = diffDays * product.pricePerDay;
  }

  const totalBasePrice = basePrice * quantity;
  const gstAmount = totalBasePrice * GST_RATE;
  const totalAmount = totalBasePrice + gstAmount;

  return {
    basePrice: totalBasePrice,
    gstAmount,
    totalAmount,
  };
};

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isLoading: false,
  appliedCoupon: null,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get("/cart");
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
          variantId: item.variantId || null,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description || "",
            category: item.product.category || "General",
            images:
              item.product.product_image_url ?
                [item.product.product_image_url]
              : [],
            isRentable: true,
            isPublished: item.product.isPublished ?? false,
            costPrice: 0,
            pricePerHour: Number(pricing.pricePerHour) || 0,
            pricePerDay: Number(pricing.pricePerDay) || 0,
            pricePerWeek: Number(pricing.pricePerWeek) || 0,
            quantityOnHand: inventory.quantityOnHand || 0,
            vendorId: item.product.vendorId,
            attributes:
              (
                typeof item.product.attributes === "object" &&
                !Array.isArray(item.product.attributes)
              ) ?
                item.product.attributes
              : {},
            attributeSchema: Array.isArray(item.product.attributeSchema) ?
              item.product.attributeSchema
            : [],
            variants:
              Array.isArray(item.product.variants) ?
                item.product.variants
              : [],
            createdAt: item.product.createdAt,
          },
          quantity: item.quantity,
          rentalDuration: "daily",
          startDate: item.rentalStart,
          endDate: item.rentalEnd,
          totalPrice: parseFloat(item.unitPrice) * item.quantity, // unitPrice * quantity for line item total
          selectedAttributes:
            item.selectedAttributes ||
            item.variant?.attributes ||
            item.product?.selectedAttributes ||
            undefined,
        };
      });

      set({ items: transformedItems, isLoading: false });
    } catch (error: any) {
      console.error("Failed to fetch cart:", error);
      set({ items: [], isLoading: false });
    }
  },

  addItem: async (
    product,
    quantity,
    duration,
    startDate,
    endDateOverride,
    variantId,
    selectedAttributes,
    pricingOverride,
  ) => {
    try {
      set({ isLoading: true });

      const deliveryDate =
        startDate instanceof Date ? startDate : new Date(startDate);
      // Use override if provided, else calculate based on duration
      const endDate =
        endDateOverride ?
          endDateOverride instanceof Date ?
            endDateOverride
          : new Date(endDateOverride)
        : calculateEndDate(deliveryDate, duration);

      const effectiveProduct = pricingOverride ?
        {
          ...product,
          pricePerHour: pricingOverride.pricePerHour ?? product.pricePerHour,
          pricePerDay: pricingOverride.pricePerDay ?? product.pricePerDay,
          pricePerWeek: pricingOverride.pricePerWeek ?? product.pricePerWeek,
        }
      : product;

      const { totalAmount } = calculateRentalCost(
        effectiveProduct,
        deliveryDate,
        endDate,
        1,
      ); // Unit price per 1 quantity for the duration

      const payload = {
        productId: product.id,
        variantId: variantId || undefined,
        quantity,
        rentalStart: deliveryDate.toISOString(),
        rentalEnd: endDate.toISOString(),
        unitPrice: totalAmount, // This is price per unit (1 item) for the full duration incl tax
        selectedAttributes: selectedAttributes || undefined,
      };

      console.log("Adding to cart with payload:", payload);

      await api.post("/cart/items", payload);

      await get().fetchCart();
      toast.success("Added to cart", {
        description: `Total: ₹${totalAmount.toFixed(2)} (incl. 18% GST)`,
      });
    } catch (error: any) {
      set({ isLoading: false });
      console.error("Add to cart error:", error.response?.data || error);
      toast.error("Failed to add to cart", {
        description: error.response?.data?.message || "Something went wrong",
      });
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      set({ isLoading: true });
      await api.delete(`/cart/items/${itemId}`);

      // Refresh cart from server to ensure sync
      await get().fetchCart();
    } catch (error: any) {
      set({ isLoading: false });
      toast.error("Failed to remove item", {
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  },

  updateItem: async (itemId, updates) => {
    try {
      set({ isLoading: true });

      const item = get().items.find((i) => i.id === itemId);
      if (!item) return;

      const payload: any = {};
      if (updates.quantity) payload.quantity = updates.quantity;

      if (updates.startDate) {
        payload.rentalStart = updates.startDate;
      }
      if (updates.endDate) {
        payload.rentalEnd = updates.endDate;
      }

      await api.patch(`/cart/items/${itemId}`, payload);

      // Refresh cart from server to ensure sync
      await get().fetchCart();
    } catch (error: any) {
      set({ isLoading: false });
      toast.error("Failed to update item", {
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true });
      await api.delete("/cart");
      // Refresh cart (should be empty, but good to confirm)
      await get().fetchCart();
      set({ appliedCoupon: null }); // Also clear applied coupon
    } catch (error: any) {
      set({ isLoading: false });
      toast.error("Failed to clear cart", {
        description: error.response?.data?.message || "Something went wrong",
      });
    }
  },

  applyCoupon: (coupon) => {
    set({ appliedCoupon: coupon });
    toast.success("Coupon Applied", {
      description: `${coupon.code} applied successfully!`,
    });
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
    toast.info("Coupon Removed");
  },

  getTotalAmount: () => {
    return get().items.reduce((total, item) => total + item.totalPrice, 0);
  },
}));
