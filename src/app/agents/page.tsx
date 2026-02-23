import { Suspense } from "react";
import { AgentsClient } from "@/components/agents/AgentsClient.client";

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500 shadow-sm">
          Loading agents…
        </div>
      }
    >
      <AgentsClient />
    </Suspense>
  );
}
