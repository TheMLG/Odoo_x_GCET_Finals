import { Address } from "@/lib/addressApi";
import { create } from "zustand";

export interface DeliverySlot {
  id: string;
  date: string;
  time: string;
  cost: number;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CheckoutState {
  // Selected address for delivery
  selectedAddress: Address | null;

  // Delivery type and slot
  deliveryType: "pickup" | "shipping" | null;
  deliverySlot: DeliverySlot | null;

  contactDetails: ContactDetails | null;

  // Actions
  setContactDetails: (details: ContactDetails | null) => void;
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
  contactDetails: null, // Initial state
  deliveryType: null,
  deliverySlot: null,

  setContactDetails: (details) => set({ contactDetails: details }),
  setSelectedAddress: (address) => set({ selectedAddress: address }),

  setDeliveryType: (type) => set({ deliveryType: type }),

  setDeliverySlot: (slot) => set({ deliverySlot: slot }),

  clearCheckout: () =>
    set({
      selectedAddress: null,
      contactDetails: null,
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
