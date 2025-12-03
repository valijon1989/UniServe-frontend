"use client";

import { AgentRoute } from "@/components/guards/AgentRoute";

export default function AgentHomePage() {
  return (
    <AgentRoute>
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6">
        <h1 className="text-xl font-semibold text-slate-100">Agent panel</h1>
        <p className="text-sm text-slate-400">Select a section: listings, services, stats.</p>
      </div>
    </AgentRoute>
  );
}
