"use client";

import type { CreativePortfolioItem } from "@/components/service-detail/creative/types";

type PortfolioShowcaseGridProps = {
  title?: string;
  subtitle?: string;
  items: CreativePortfolioItem[];
  onPreview: (item: CreativePortfolioItem) => void;
};

export function PortfolioShowcaseGrid({
  title = "Portfolio showcase",
  subtitle,
  items,
  onPreview
}: PortfolioShowcaseGridProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Portfolio</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPreview(item)}
            className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/70 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.mediaSrc}
                alt={item.mediaAlt}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.46))]" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-900">
                  {item.badge}
                </span>
                {item.projectType ? (
                  <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    {item.projectType}
                  </span>
                ) : null}
              </div>
              {item.mediaKind === "video" ? (
                <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-sm text-slate-950 shadow-sm">
                  ▶
                </span>
              ) : null}
            </div>

            <div className="space-y-3 p-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
                  {item.clientLabel ? <span className="text-[11px] text-slate-500">{item.clientLabel}</span> : null}
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {item.metrics.map((metric) => (
                  <div key={`${item.id}-${metric.label}`} className="rounded-2xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
                    <p className="mt-1 font-semibold text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
