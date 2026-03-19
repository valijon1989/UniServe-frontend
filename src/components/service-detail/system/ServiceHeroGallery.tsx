"use client";

import { useEffect, useMemo, useState } from "react";

import type { SystemMediaItem } from "@/components/service-detail/system/types";

export function ServiceHeroGallery({
  items,
  fallbackSrc = "/images/fallback-service.png",
  priceLabel,
  pricingModel,
  stats = []
}: {
  items: SystemMediaItem[];
  fallbackSrc?: string;
  priceLabel?: string;
  pricingModel?: string;
  stats?: Array<{ label: string; value: string }>;
}) {
  const galleryItems = useMemo<SystemMediaItem[]>(() => {
    const normalized = items.filter((item) => Boolean(item?.src));
    return normalized.length ? normalized : [{ src: fallbackSrc, alt: "Service preview" }];
  }, [fallbackSrc, items]);
  const gallerySignature = useMemo(() => galleryItems.map((item) => item.src).join("|"), [galleryItems]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [gallerySignature]);

  const activeItem = galleryItems[Math.min(activeIndex, galleryItems.length - 1)] || galleryItems[0];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-950/20">
      <div className="grid gap-4 xl:grid-cols-[96px_minmax(0,1fr)]">
        <div className="order-2 flex gap-3 overflow-x-auto pb-1 xl:order-1 xl:flex-col xl:overflow-visible xl:pb-0">
          {galleryItems.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${item.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 w-20 flex-none overflow-hidden rounded-2xl border transition ${
                  active
                    ? "border-sky-300 shadow-[0_0_0_1px_rgba(125,211,252,0.6)]"
                    : "border-white/10 hover:border-white/25"
                }`}
                aria-label={`Open service media ${index + 1}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackSrc;
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="order-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 xl:order-2">
          <div className="relative aspect-[16/10]">
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackSrc;
              }}
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <span className="rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-[11px] font-semibold text-white">
                {activeIndex + 1} / {galleryItems.length}
              </span>
              {priceLabel ? (
                <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/75 px-4 py-3 text-right backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Narx</p>
                  <p className="mt-1 text-lg font-black text-white sm:text-xl">{priceLabel}</p>
                  {pricingModel ? <p className="text-[11px] text-slate-300">{pricingModel}</p> : null}
                </div>
              ) : null}
            </div>
            {stats.length > 0 ? (
              <div className="absolute inset-x-0 bottom-0 grid gap-2 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-transparent p-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {activeItem.caption ? (
            <div className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">{activeItem.caption}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
