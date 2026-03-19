"use client";

import Link from "next/link";
import type { RelatedDetailItem } from "@/components/service-detail/types";

type ServiceRelatedProps = {
  title?: string;
  items: RelatedDetailItem[];
};

export function ServiceRelated({ title = "O'xshash xizmatlar", items }: ServiceRelatedProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">ServiceRelated</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/88 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
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
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {item.tag}
                  </span>
                ) : null}
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
                  {item.subtitle ? <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p> : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  {item.rating ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                      ★ {item.rating.toFixed(1)}
                    </span>
                  ) : null}
                  {item.priceLabel ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      {item.priceLabel}
                    </span>
                  ) : null}
                </div>

                {item.meta ? <p className="text-xs text-slate-500">{item.meta}</p> : null}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
            Hozircha o'xshash xizmatlar topilmadi. Yangi e'lonlar shu bo'limda ko'rinadi.
          </div>
        )}
      </div>
    </section>
  );
}
