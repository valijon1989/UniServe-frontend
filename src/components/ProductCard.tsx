"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/api/products";

interface ProductCardProps {
  data: Product;
  disableNavigation?: boolean;
  onCardClick?: () => void;
}

const palette = ["#0ea5e9", "#10b981", "#f97316", "#a855f7", "#ef4444", "#14b8a6"];

const hashValue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export default function ProductCard({ data, disableNavigation = false, onCardClick }: ProductCardProps) {
  const router = useRouter();
  const productId = data._id || data.id || "";
  const seed = (productId || data.name || data.title || "").toString();
  const hash = useMemo(() => hashValue(seed), [seed]);

  const handleOpen = () => {
    if (typeof window !== "undefined" && productId) {
      try {
        const key = `product-preview-${productId}`;
        window.sessionStorage.setItem(key, JSON.stringify(data));
      } catch {
        // storage may be unavailable; fail silently
      }
    }
    if (disableNavigation) {
      onCardClick?.();
      return;
    }
    if (onCardClick) {
      onCardClick();
      return;
    }
    if (productId) {
      router.push(`/products/${productId}`);
    }
  };

  const price = data.price ? data.price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—";
  const oldPrice = data.oldPrice ? data.oldPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : null;
  const rating = data.rating?.avg ?? 0;
  const ratingCount = data.rating?.count ?? 0;
  const stats = data.stats || { views: data.views ?? 0, likes: data.likes ?? 0, purchases: data.orders ?? 0 };
  const imageSrc = data.thumbnail || data.images?.[0] || "/placeholder.png";
  const deliveryOptions = [
    { key: "fast", label: "Tez yetkazish" },
    { key: "tomorrow", label: "Ertaga" },
    { key: "standard", label: "Oddiy" }
  ];
  const delivery = deliveryOptions[hash % deliveryOptions.length];
  const isFreeDelivery = (data.price ?? 0) >= 100 || hash % 2 === 0;
  const isBestSeller = (stats.purchases ?? 0) > 300 || hash % 5 === 0;
  const isVerified = rating >= 4.7 && ratingCount >= 100;
  const variantsCount = data.images?.length ?? 0;
  const variantDots = Math.min(4, variantsCount);

  return (
    <div
      onClick={handleOpen}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
        <img
          src={imageSrc}
          alt={data.name || data.title || "Mahsulot"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.png";
          }}
        />
        {data.category && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {data.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
            {data.name || data.title || "Mahsulot"}
          </h3>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            ⭐ {rating.toFixed(1)}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">
          {data.description || "Qisqacha tavsif hozircha mavjud emas."}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{delivery.label}</span>
          {isFreeDelivery && <span className="rounded-full bg-slate-100 px-2 py-1">Bepul yetkazish</span>}
          {isBestSeller && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Best seller</span>}
          {isVerified && <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">Verified seller</span>}
        </div>
        {variantDots > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              {Array.from({ length: variantDots }).map((_, idx) => (
                <span
                  key={`variant-${seed}-${idx}`}
                  className="h-3 w-3 rounded-full border border-white shadow"
                  style={{ backgroundColor: palette[(hash + idx) % palette.length] }}
                />
              ))}
            </div>
            {variantsCount > variantDots && <span>+{variantsCount - variantDots}</span>}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-900">${price}</p>
            {oldPrice && <p className="text-sm text-slate-400 line-through">${oldPrice}</p>}
            <p className="text-xs text-slate-500">{ratingCount} ta baho</p>
          </div>
          <div className="flex gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-2 py-1">👁 {stats.views ?? 0}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">❤️ {stats.likes ?? 0}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">🛒 {stats.purchases ?? 0}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              alert("Savatga qo'shildi (demo)");
            }}
            className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow"
          >
            Savatga
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              alert("Saqlab qo'yildi (demo)");
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
          >
            ❤️ Saqlash
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              alert("Tez sotib olish (demo)");
            }}
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          >
            Tez sotib olish
          </button>
        </div>
      </div>
    </div>
  );
}
