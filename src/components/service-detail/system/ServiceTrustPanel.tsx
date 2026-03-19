"use client";

import type { DetailTrustIndicator } from "@/components/service-detail/types";

const toneClass: Record<NonNullable<DetailTrustIndicator["tone"]>, string> = {
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-100",
  sky: "from-sky-500/15 to-sky-500/5 text-sky-100",
  amber: "from-amber-500/15 to-amber-500/5 text-amber-100"
};

export function ServiceTrustPanel({
  title = "Ishonch signallari",
  subtitle,
  indicators
}: {
  title?: string;
  subtitle?: string;
  indicators: DetailTrustIndicator[];
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {indicators.map((indicator) => (
          <article
            key={`${indicator.label}-${indicator.value}`}
            className={`rounded-[1.35rem] border border-white/10 bg-gradient-to-br p-4 ${
              toneClass[indicator.tone || "sky"]
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">{indicator.label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{indicator.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
