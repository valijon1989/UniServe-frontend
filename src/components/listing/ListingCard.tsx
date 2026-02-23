"use client";

import Image from "next/image";
import Link from "next/link";
import dayjs from "@/lib/dayjs";
import { useState } from "react";
import { normalizeImageUrl } from "@/lib/imageUrl";

export type ListingType = "product" | "service";

export type ListingCardItem = {
  _id: string;
  type: ListingType;
  title: string;
  description?: string;
  href?: string;
  price?: number;
  oldPrice?: number;
  off?: number;
  currency?: string;
  category?: string;
  createdAt?: string;
  coverImageUrl?: string | null;
  images?: string[];
  stats?: { likes?: number; views?: number; orders?: number };
  ratingAvg?: number;
  ratingCount?: number;
  tag?: string;
};

export function ListingCard({ item, compact = false }: { item: ListingCardItem; compact?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const primary = normalizeImageUrl(item.coverImageUrl) || normalizeImageUrl(item.images?.[0] || null);
  const fallbackSrc = item.type === "product" ? "/images/fallback-product.png" : "/images/fallback-service.png";
  const finalSrc = imageFailed || !primary ? fallbackSrc : primary;
  const thumbs = (item.images || [])
    .map((img) => normalizeImageUrl(img))
    .filter((img): img is string => Boolean(img))
    .slice(0, 3);
  const isLocalhost = finalSrc.startsWith("http://localhost:5001/");
  const likes = item.stats?.likes ?? 0;
  const views = item.stats?.views ?? 0;
  const orders = item.stats?.orders ?? 0;
  const currency = item.currency || "";
  const timeText = item.createdAt ? dayjs(item.createdAt).fromNow() : null;
  const badge = item.tag || (item.type === "product" ? "Mahsulot" : "Xizmat");

  const cardBody = (
    <>
      <div className={`relative w-full overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/60 ${compact ? "h-32" : "h-36"}`}>
        {isLocalhost ? (
          <img
            key={`${item.type}-${item._id}-img`}
            src={finalSrc}
            alt={item.title}
            className="h-full w-full object-cover text-transparent transition duration-300 group-hover:scale-105"
            onError={() => {
              if (!imageFailed && primary) {
                setImageFailed(true);
                console.warn("Image failed", { id: item._id, type: item.type, url: primary });
              }
            }}
          />
        ) : (
          <Image
            key={`${item.type}-${item._id}-img`}
            src={finalSrc}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            unoptimized={isLocalhost}
            onError={() => {
              if (!imageFailed && primary) {
                setImageFailed(true);
                console.warn("Image failed", { id: item._id, type: item.type, url: primary });
              }
            }}
          />
        )}
      </div>

      {!compact && thumbs.length > 0 && (
        <div className="mt-2 flex gap-2">
          {thumbs.map((img, idx) => (
            <div key={`${item.type}-${item._id}-thumb-${idx}`} className="h-8 w-10 overflow-hidden rounded border border-slate-800/70 bg-slate-900/60">
              <img
                src={img}
                alt={`${item.title} ${idx + 1}`}
                className="h-full w-full object-cover"
                onError={() => {
                  console.warn("Image failed", { id: item._id, type: item.type, url: img });
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-300">
            {badge}
          </span>
          {timeText && <span>⏱ {timeText}</span>}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-100">{item.title}</h3>
        {item.description && <p className="line-clamp-2 text-xs text-slate-400">{item.description}</p>}
        {item.category && (
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-300">
            <span>🏷</span>
            <span>{item.category}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
        {typeof item.price === "number" && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200">
            💰 {currency}{item.price.toLocaleString("en-US")}
          </span>
        )}
        {typeof item.oldPrice === "number" && (
          <span className="text-slate-500 line-through">
            {currency}{item.oldPrice.toLocaleString("en-US")}
          </span>
        )}
        {typeof item.off === "number" && item.off > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-100">
            -{item.off}%
          </span>
        )}
        {typeof item.ratingAvg === "number" && (
          <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
            ⭐ {item.ratingAvg.toFixed(1)} {item.ratingCount ? `(${item.ratingCount})` : ""}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-3 text-[11px] text-slate-300">
        <span>❤ {likes}</span>
        <span>👁 {views}</span>
        <span>🧾 {orders}</span>
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-sky-500/60 ${compact ? "h-[300px]" : "h-[360px]"}`}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <article className={`group flex cursor-not-allowed flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-lg shadow-black/30 ${compact ? "h-[300px]" : "h-[360px]"}`}>
      {cardBody}
    </article>
  );
}
