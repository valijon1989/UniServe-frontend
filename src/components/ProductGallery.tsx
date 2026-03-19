"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/context/i18n";

export function ProductGallery({
  images,
  alt,
  title
}: {
  images: string[];
  alt: string;
  title?: string;
}) {
  const { t } = useI18n();
  const safeImages = useMemo(() => {
    const unique = Array.from(new Set((images || []).map((item) => String(item || "").trim()).filter(Boolean)));
    return unique.length ? unique : ["/placeholder.png"];
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setMainLoaded(false);
  }, [safeImages]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
      <div className="grid gap-5 p-5 xl:grid-cols-[104px_minmax(0,1fr)]">
        <div className="order-2 flex gap-3 overflow-x-auto xl:order-1 xl:flex-col">
          {safeImages.map((src, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setMainLoaded(false);
                }}
                className={`overflow-hidden rounded-2xl border transition ${
                  active ? "border-emerald-400 shadow-lg shadow-emerald-100" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img
                  src={src}
                  alt={`${alt} ${index + 1}`}
                  className="h-20 w-20 object-cover xl:h-24 xl:w-full"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/placeholder.png";
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="order-1 space-y-4 xl:order-2">
          <div
            className="group relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            {!mainLoaded ? (
              <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(241,245,249,0.95),rgba(226,232,240,0.85),rgba(241,245,249,0.95))]" />
            ) : null}
            <img
              src={safeImages[activeIndex]}
              alt={alt}
              className={`h-[340px] w-full object-cover transition duration-300 sm:h-[520px] ${
                zoomed ? "scale-[1.08]" : "scale-100"
              } ${mainLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setMainLoaded(true)}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.png";
                setMainLoaded(true);
              }}
            />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between">
              <span className="rounded-full bg-slate-950/72 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                {t({
                  en: "Real product media",
                  uz: "Haqiqiy mahsulot rasmlari",
                  ru: "Реальные фото товара",
                  ko: "실제 상품 미디어"
                })}
              </span>
              {safeImages.length > 1 ? (
                <span className="rounded-full bg-white/88 px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm">
                  {activeIndex + 1}/{safeImages.length}
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {safeImages.slice(0, 4).map((src, index) => (
              <div key={`preview-${src}-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <img
                  src={src}
                  alt={`${alt} preview ${index + 1}`}
                  className="h-28 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/placeholder.png";
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
            {title ? <p>{t({ en: "Gallery", uz: "Galereya", ru: "Галерея", ko: "갤러리" })} · {title}</p> : null}
            <p>
              {t({
                en: "Thumbnail click updates main image",
                uz: "Thumbnail bosilganda asosiy rasm almashadi",
                ru: "Нажмите миниатюру, чтобы сменить главное фото",
                ko: "썸네일을 누르면 메인 이미지가 바뀝니다"
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
