"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function UserRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, role, isHydrated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (role !== "USER" && role !== "AGENT" && role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, role, isHydrated, router]);

  if (!isHydrated) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
