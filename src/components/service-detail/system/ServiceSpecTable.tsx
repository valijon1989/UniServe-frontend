"use client";

import type { SystemSpecRow } from "@/components/service-detail/system/types";

const toneClass: Record<NonNullable<SystemSpecRow["tone"]>, string> = {
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  amber: "text-amber-200",
  slate: "text-white"
};

export function ServiceSpecTable({
  title,
  eyebrow,
  subtitle,
  rows
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  rows: SystemSpecRow[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">{eyebrow}</p> : null}
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={`${row.label}-${row.value}`} className="rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{row.label}</p>
            <p className={`mt-2 text-sm font-semibold leading-6 ${toneClass[row.tone || "slate"]}`}>{row.value}</p>
            {row.hint ? <p className="mt-2 text-xs leading-5 text-slate-400">{row.hint}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
