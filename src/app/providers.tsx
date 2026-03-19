"use client";

import { ReactNode, useEffect } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "@/context/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalImageLightbox } from "@/components/shared/GlobalImageLightbox";
import {
  AUTH_LOGOUT_STORAGE_KEY,
  applyLogoutSignal,
  getDefaultLogoutRedirect,
  subscribeToLogoutBroadcast
} from "@/lib/authSession";

function AuthStorageSync() {
  useEffect(() => {
    const syncLogout = (signal?: { at?: number; audience?: "ADMIN" | "USER" | "AGENT"; redirectTo?: string | null }) => {
      const applied = applyLogoutSignal({
        at: signal?.at,
        audience: signal?.audience,
        redirectTo: signal?.redirectTo || undefined,
        source: "sync"
      });

      const redirectTo = applied.redirectTo || getDefaultLogoutRedirect(applied.audience);
      if (window.location.pathname !== redirectTo) {
        window.location.replace(redirectTo);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_LOGOUT_STORAGE_KEY || !event.newValue) return;
      const at = Number(event.newValue);
      if (!Number.isFinite(at) || at <= 0) return;
      syncLogout({ at });
    };

    const unsubscribe = subscribeToLogoutBroadcast((signal) => {
      syncLogout(signal);
    });

    window.addEventListener("storage", onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
  axios.defaults.withCredentials = true;

  return (
    <I18nProvider>
      <AuthProvider>
        <AuthStorageSync />
        {children}
        <Toaster />
        <GlobalImageLightbox />
      </AuthProvider>
    </I18nProvider>
  );
}
