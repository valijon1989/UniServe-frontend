"use client";

import type { AgentOfferPreview } from "@/components/agent-preview/types";

export function AgentOfferPreviewList({
  title = "Top offers",
  items
}: {
  title?: string;
  items: AgentOfferPreview[];
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{items.length} ta</span>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article key={`${item.title}-${item.priceLabel}`} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.description ? <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p> : null}
              </div>
              {item.badge ? (
                <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-100">
                  {item.badge}
                </span>
              ) : null}
            </div>
            {(item.meta || item.priceLabel) ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                {item.meta ? <span className="text-slate-500">{item.meta}</span> : <span />}
                {item.priceLabel ? <span className="font-semibold text-emerald-100">{item.priceLabel}</span> : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
