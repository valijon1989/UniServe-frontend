"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreativePortfolioItem, CreativeStat } from "@/components/service-detail/creative/types";

type CreativeServiceHeroProps = {
  breadcrumb: string[];
  categoryLabel: string;
  title: string;
  subtitle: string;
  items: CreativePortfolioItem[];
  stats: CreativeStat[];
  onPreview: (item: CreativePortfolioItem) => void;
};

const mediaKindLabel: Record<CreativePortfolioItem["mediaKind"], string> = {
  image: "Image preview",
  video: "Video preview"
};

export function CreativeServiceHero({
  breadcrumb,
  categoryLabel,
  title,
  subtitle,
  items,
  stats,
  onPreview
}: CreativeServiceHeroProps) {
  const galleryItems = useMemo(() => items.slice(0, Math.max(items.length, 1)), [items]);
  const gallerySignature = useMemo(() => galleryItems.map((item) => item.id).join("|"), [galleryItems]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [gallerySignature]);

  const activeItem = galleryItems[Math.min(activeIndex, Math.max(galleryItems.length - 1, 0))];

  if (!activeItem) return null;

  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.92),rgba(255,247,237,0.92))] p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {breadcrumb.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="text-slate-300">/</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(240px,0.82fr)]">
        <div className="space-y-5">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {categoryLabel}
            </span>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-[2.8rem]">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">{subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.map((item) => (
              <div key={`${item.label}-${item.value}`} className="rounded-full border border-white/80 bg-white/80 px-3 py-2 text-sm shadow-sm">
                <span className="text-slate-500">{item.label}: </span>
                <span className="font-semibold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onPreview(activeItem)}
            className="group block w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-left shadow-xl shadow-slate-200/70"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={activeItem.mediaSrc}
                alt={activeItem.mediaAlt}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0.72))]" />
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-900">
                  {activeItem.badge}
                </span>
                <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-white">
                  {mediaKindLabel[activeItem.mediaKind]}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/70">
                  {activeItem.projectType || "Portfolio highlight"}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black tracking-tight">{activeItem.title}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{activeItem.summary}</p>
                  </div>
                  <span className="hidden rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold md:inline-flex">
                    Keng preview
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="space-y-3">
          {galleryItems.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-[1.5rem] border p-3 text-left transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-200"
                    : "border-slate-200 bg-white/85 text-slate-800 hover:-translate-y-0.5 hover:border-slate-300"
                }`}
              >
                <div className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl">
                  <img src={item.mediaSrc} alt={item.mediaAlt} className="h-full w-full object-cover" />
                  {item.mediaKind === "video" ? (
                    <span className="absolute inset-0 grid place-items-center bg-slate-950/30 text-lg text-white">▶</span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {item.badge}
                    </span>
                    {item.clientLabel ? (
                      <span className={`text-[11px] ${active ? "text-white/70" : "text-slate-500"}`}>{item.clientLabel}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold">{item.title}</p>
                  <p className={`mt-1 line-clamp-2 text-xs leading-5 ${active ? "text-white/70" : "text-slate-500"}`}>
                    {item.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
