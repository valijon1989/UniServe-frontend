"use client";

import { useEffect, useMemo, useState } from "react";
import type { DetailMediaItem } from "@/components/service-detail/types";

type ServiceGalleryProps = {
  items: DetailMediaItem[];
  fallbackSrc?: string;
};

export function ServiceGallery({ items, fallbackSrc = "/images/fallback-service.png" }: ServiceGalleryProps) {
  const galleryItems = useMemo<DetailMediaItem[]>(() => {
    const normalized = items.filter((item) => Boolean(item?.src));
    if (normalized.length > 0) return normalized;
    return [{ src: fallbackSrc, alt: "Service image" }];
  }, [fallbackSrc, items]);
  const gallerySignature = useMemo(() => galleryItems.map((item) => item.src).join("|"), [galleryItems]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [gallerySignature]);

  const activeItem = galleryItems[Math.min(activeIndex, galleryItems.length - 1)] || galleryItems[0];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/88 p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[92px_minmax(0,1fr)]">
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
          {galleryItems.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${item.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 w-20 flex-none overflow-hidden rounded-2xl border transition ${
                  active
                    ? "border-sky-400 shadow-lg shadow-sky-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                aria-label={`Open image ${index + 1}`}
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
                {active ? <span className="absolute inset-0 ring-2 ring-inset ring-sky-300" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>

        <div className="order-1 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 lg:order-2">
          <div className="relative aspect-[4/3]">
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackSrc;
              }}
            />
            <div className="absolute left-4 top-4 inline-flex rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {galleryItems.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
