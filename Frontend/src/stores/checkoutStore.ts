import { Address } from "@/lib/addressApi";
import { create } from "zustand";

export interface DeliverySlot {
  id: string;
  date: string;
  time: string;
  cost: number;
}

interface CheckoutState {
  // Selected address for delivery
  selectedAddress: Address | null;

  // Delivery type and slot
  deliveryType: "pickup" | "shipping" | null;
  deliverySlot: DeliverySlot | null;

  // Actions
  setSelectedAddress: (address: Address | null) => void;
  setDeliveryType: (type: "pickup" | "shipping") => void;
  setDeliverySlot: (slot: DeliverySlot | null) => void;

  // Clear all checkout state
  clearCheckout: () => void;

  // Get delivery cost
  getDeliveryCost: () => number;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  selectedAddress: null,
  deliveryType: null,
  deliverySlot: null,

  setSelectedAddress: (address) => set({ selectedAddress: address }),

  setDeliveryType: (type) => set({ deliveryType: type }),

  setDeliverySlot: (slot) => set({ deliverySlot: slot }),

  clearCheckout: () =>
    set({
      selectedAddress: null,
      deliveryType: null,
      deliverySlot: null,
    }),

  getDeliveryCost: () => {
    const state = get();
    if (state.deliveryType === "shipping" && state.deliverySlot) {
      return state.deliverySlot.cost;
    }
    return 0;
  },
}));
