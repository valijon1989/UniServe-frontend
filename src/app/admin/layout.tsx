import type { ReactNode } from "react";
import { AdminLayoutGate } from "@/components/admin/AdminLayoutGate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutGate>{children}</AdminLayoutGate>;
}
