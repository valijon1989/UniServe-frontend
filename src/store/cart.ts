"use client";

import { create } from "zustand";
import { getCart, getLocalCartSummary, type CartSummary } from "@/api/commerce";
import { useAuthStore } from "@/store/auth";

interface CartState {
  summary: CartSummary;
  isReady: boolean;
  isRefreshing: boolean;
  hydrateFromStorage: () => void;
  syncFromSummary: (summary: CartSummary) => void;
  refresh: () => Promise<CartSummary>;
}

const EMPTY_CART_SUMMARY: CartSummary = {
  items: [],
  totalItems: 0,
  counts: { product: 0, service: 0 },
  subtotal: 0,
  currency: "USD",
  updatedAt: ""
};

export const useCartStore = create<CartState>((set) => ({
  summary: EMPTY_CART_SUMMARY,
  isReady: false,
  isRefreshing: false,
  hydrateFromStorage: () => {
    set({
      summary: getLocalCartSummary(),
      isReady: true
    });
  },
  syncFromSummary: (summary) => {
    set({
      summary,
      isReady: true
    });
  },
  refresh: async () => {
    set({ isRefreshing: true });
    try {
      if (!useAuthStore.getState().isAuthenticated) {
        const summary = getLocalCartSummary();
        set({
          summary,
          isReady: true,
          isRefreshing: false
        });
        return summary;
      }
      const summary = await getCart();
      set({
        summary,
        isReady: true,
        isRefreshing: false
      });
      return summary;
    } catch (error) {
      set({ isRefreshing: false });
      throw error;
    }
  }
}));
