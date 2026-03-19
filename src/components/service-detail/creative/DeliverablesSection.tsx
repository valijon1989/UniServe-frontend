"use client";

import type { CreativeDeliverable } from "@/components/service-detail/creative/types";

type DeliverablesSectionProps = {
  title?: string;
  subtitle?: string;
  items: CreativeDeliverable[];
};

export function DeliverablesSection({
  title = "Deliverables",
  subtitle,
  items
}: DeliverablesSectionProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Scope</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={`${item.label}-${item.value}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-lg font-bold tracking-tight text-slate-950">{item.value}</p>
            {item.hint ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.hint}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
