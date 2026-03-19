"use client";

import { useEffect } from "react";
import type { CreativePortfolioItem } from "@/components/service-detail/creative/types";

type PortfolioItemPreviewModalProps = {
  item: CreativePortfolioItem | null;
  onClose: () => void;
};

export function PortfolioItemPreviewModal({ item, onClose }: PortfolioItemPreviewModalProps) {
  useEffect(() => {
    if (!item) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-4 py-6" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg text-slate-900 shadow-sm"
          aria-label="Close preview"
        >
          ×
        </button>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="relative bg-slate-950">
            <div className="aspect-[4/3]">
              <img src={item.mediaSrc} alt={item.mediaAlt} className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-900">
                {item.badge}
              </span>
              <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-white">
                {item.mediaKind === "video" ? "Video preview" : "Image preview"}
              </span>
            </div>
            {item.mediaKind === "video" ? (
              <span className="absolute bottom-4 right-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-slate-900 shadow-sm">
                ▶
              </span>
            ) : null}
          </div>

          <div className="space-y-5 p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {item.projectType || "Portfolio item"}
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{item.title}</h3>
              {item.clientLabel ? <p className="mt-2 text-sm text-slate-500">{item.clientLabel}</p> : null}
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {item.metrics.map((metric) => (
                <div key={`${item.id}-${metric.label}`} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Bu portfolio preview xizmat sifati, uslub va output formatini ko'rsatadi. Rasmiy buyurtma uchun buyurtma blokidan foydalaning, aniqlik kiritish uchun esa chatni oching.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
