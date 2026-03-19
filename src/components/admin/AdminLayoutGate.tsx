"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAccessProvider } from "@/hooks/useAdminAccess";

export function AdminLayoutGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <AdminAccessProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAccessProvider>
  );
}
