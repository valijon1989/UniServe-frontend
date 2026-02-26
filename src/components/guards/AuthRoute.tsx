"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

function AuthGuardFallback({ message }: { message: string }) {
  return (
    <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/75 p-6 text-center shadow-xl shadow-black/30">
        <span className="mx-auto mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-300/40 border-t-sky-300" />
        <p className="text-sm text-slate-200">{message}</p>
      </div>
    </div>
  );
}

export function AuthRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <AuthGuardFallback message="Yuklanmoqda..." />;
  }
  if (isAuthenticated) {
    return <AuthGuardFallback message="Bosh sahifaga yo'naltirilmoqda..." />;
  }
  return <>{children}</>;
}
