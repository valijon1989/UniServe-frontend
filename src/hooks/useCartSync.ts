"use client";

import { useEffect } from "react";
import { subscribeCartUpdates } from "@/api/commerce";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

export function useCartSync() {
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrateFromStorage = useCartStore((state) => state.hydrateFromStorage);
  const refresh = useCartStore((state) => state.refresh);
  const syncFromSummary = useCartStore((state) => state.syncFromSummary);

  useEffect(() => subscribeCartUpdates(syncFromSummary), [syncFromSummary]);

  useEffect(() => {
    if (!isAuthHydrated) return;
    hydrateFromStorage();
    if (!isAuthenticated) return;
    void refresh().catch(() => undefined);
  }, [hydrateFromStorage, isAuthHydrated, isAuthenticated, refresh]);
}
