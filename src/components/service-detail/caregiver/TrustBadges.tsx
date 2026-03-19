"use client";

import type { CaregiverTrustBadgeItem } from "@/components/service-detail/caregiver/types";

type TrustBadgesProps = {
  items: CaregiverTrustBadgeItem[];
};

const toneClassMap: Record<NonNullable<CaregiverTrustBadgeItem["tone"]>, string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800"
};

export function TrustBadges({ items }: TrustBadgesProps) {
  return (
    <section className="rounded-[1.85rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Trust indicators</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className={`rounded-2xl border px-4 py-3 ${
              item.tone ? toneClassMap[item.tone] : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
            <p className="mt-1 text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
