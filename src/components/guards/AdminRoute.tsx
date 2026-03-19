"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function AdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, role, isHydrated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/admin/login");
    } else if (role !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, role, isHydrated, router]);

  if (!isHydrated) return null;
  if (!isAuthenticated) return null;
  if (role !== "ADMIN") return null;
  return <>{children}</>;
}
