"use client";

import React from "react";
import { I18nProvider } from "@/context/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

function StartupLogger() {
  useEffect(() => {
    // Simple startup log for dev visibility
    console.log("UniServe Frontend running (port 3000)");
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrateAuth = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <I18nProvider>
      <AuthProvider>
        <StartupLogger />
        {children}
      </AuthProvider>
    </I18nProvider>
  );
}
