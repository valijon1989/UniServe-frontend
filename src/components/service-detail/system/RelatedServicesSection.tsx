"use client";

import Link from "next/link";

import type { RelatedDetailItem } from "@/components/service-detail/types";

export function RelatedServicesSection({
  title = "O'xshash xizmatlar",
  items
}: {
  title?: string;
  items: RelatedDetailItem[];
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/15">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">Related services</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{title}</h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-950/45 transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/fallback-service.png";
                  }}
                />
                {item.tag ? (
                  <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {item.tag}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-white">{item.title}</h3>
                  {item.subtitle ? <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  {item.rating ? (
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-amber-100">
                      ★ {item.rating.toFixed(1)}
                    </span>
                  ) : null}
                  {item.priceLabel ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-100">
                      {item.priceLabel}
                    </span>
                  ) : null}
                </div>
                {item.meta ? <p className="text-xs text-slate-500">{item.meta}</p> : null}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="text-xs font-medium text-slate-400">Quick fit check</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white transition group-hover:border-white/20">
                    Ko'rish
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-white/15 bg-slate-950/30 px-5 py-8 text-sm text-slate-400 md:col-span-2 xl:col-span-3">
            Hozircha o'xshash xizmatlar topilmadi. Yangi e'lonlar shu bo'limda ko'rinadi.
          </div>
        )}
      </div>
    </section>
  );
}
