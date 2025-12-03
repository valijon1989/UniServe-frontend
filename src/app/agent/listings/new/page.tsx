"use client";

import { AgentRoute } from "@/components/guards/AgentRoute";

export default function NewListingPage() {
  return (
    <AgentRoute>
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
        <h1 className="text-xl font-semibold text-slate-100">Create Listing</h1>
        <p className="text-sm text-slate-400">Form coming soon.</p>
      </div>
    </AgentRoute>
  );
}
