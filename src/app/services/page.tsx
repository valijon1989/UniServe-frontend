import { Suspense } from "react";
import { ServicesClient } from "@/components/services/ServicesClient";

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500 shadow-sm">
          Loading services…
        </div>
      }
    >
      <ServicesClient />
    </Suspense>
  );
}
