import { Suspense } from "react";
import { AgentsClient } from "@/components/agents/AgentsClient.client";

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
          <div className="mx-auto max-w-sm animate-pulse space-y-3">
            <div className="h-4 rounded-full bg-slate-200/80" />
            <div className="h-4 rounded-full bg-slate-200/70" />
            <div className="h-10 rounded-2xl bg-slate-200/60" />
          </div>
        </div>
      }
    >
      <AgentsClient />
    </Suspense>
  );
}
