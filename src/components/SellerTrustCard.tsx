"use client";

import { SellerAgentCard } from "@/components/detail/SellerAgentCard";

interface SellerTrustCardRow {
  label: string;
  value: string;
}

interface SellerTrustCardMetric {
  label: string;
  value: string;
}

export function SellerTrustCard({
  name,
  username,
  avatarSrc,
  fallbackText,
  trustLine,
  metaRows,
  metrics,
  highlights
}: {
  name: string;
  username?: string | null;
  avatarSrc?: string | null;
  fallbackText: string;
  trustLine?: string | null;
  metaRows: SellerTrustCardRow[];
  metrics: SellerTrustCardMetric[];
  highlights: string[];
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Seller trust</p>
          <p className="mt-1 text-lg font-black tracking-tight text-slate-950">Sotuvchi profili</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">Verified</span>
      </div>

      <SellerAgentCard
        avatarSrc={avatarSrc}
        fallbackText={fallbackText}
        name={name}
        username={username}
        badge="Seller"
        trustLine={trustLine}
        metaRows={metaRows}
        metrics={metrics}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {highlights.map((highlight) => (
          <span key={highlight} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {highlight}
          </span>
        ))}
      </div>
    </section>
  );
}

