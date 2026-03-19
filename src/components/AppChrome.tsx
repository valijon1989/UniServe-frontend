"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isWideMarketplaceRoute =
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/services") ||
    pathname?.startsWith("/courses");
  const isStandaloneAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/auth/login" ||
    pathname === "/auth/signup";

  if (isAdminRoute || isStandaloneAuthRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <Suspense fallback={<div className="h-20" />}>
        <Header />
      </Suspense>
      <main className={isWideMarketplaceRoute ? "mx-auto max-w-[1480px] px-4 pb-10 pt-4" : "mx-auto max-w-6xl px-4 pb-10 pt-4"}>
        {children}
      </main>
      <Footer />
    </>
  );
}
