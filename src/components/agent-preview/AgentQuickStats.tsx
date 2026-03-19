"use client";

import type { AgentQuickStat } from "@/components/agent-preview/types";

const toneClass: Record<NonNullable<AgentQuickStat["tone"]>, string> = {
  sky: "bg-sky-500/10 text-sky-100 border-sky-400/20",
  emerald: "bg-emerald-500/10 text-emerald-100 border-emerald-400/20",
  amber: "bg-amber-500/10 text-amber-100 border-amber-400/20",
  slate: "bg-white/5 text-white border-white/10"
};

export function AgentQuickStats({ items }: { items: AgentQuickStat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <article key={`${item.label}-${item.value}`} className={`rounded-[1.25rem] border px-4 py-3 ${toneClass[item.tone || "slate"]}`}>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
        </article>
      ))}
    </div>
  );
}
