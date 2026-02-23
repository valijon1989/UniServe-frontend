"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ServiceListItem } from "@/lib/servicesTypes";
import { useI18n } from "@/context/i18n";
import { getServiceImageUrl } from "@/lib/serviceImage";

type Props = {
  service: ServiceListItem;
  onLike: (id: string, next: boolean) => void;
  onSave: (id: string, next: boolean) => void;
};

const buildViewKey = (id: string) => `service_viewed_${id}`;

export function ServiceCard({ service, onLike, onSave }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tracked, setTracked] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(buildViewKey(service.id))) {
      setTracked(true);
    }
  }, [service.id]);

  useEffect(() => {
    if (!ref.current || tracked) return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(buildViewKey(service.id), "1");
            }
            setTracked(true);
            fetch(`/api/services/${service.id}/view`, { method: "POST", keepalive: true }).catch(() => undefined);
          }
        });
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [service.id, tracked]);

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg">
      <div className="relative w-full overflow-hidden bg-slate-900 aspect-video">
        {service.coverType === "video" ? (
          <video src={service.coverUrl} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <img
            src={
              service.coverUrl ??
              getServiceImageUrl(service.category || "consulting", service.id)
            }
            alt={service.title}
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs text-slate-100">
          {service.priceLabel}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">{service.title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <img
                src={service.provider.avatarUrl || "/placeholder.png"}
                alt={service.provider.name}
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="font-semibold text-slate-200">{service.provider.name}</span>
              {service.provider.verified && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200">
                  {t("services.card.verified")}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-amber-200">
            ⭐ {service.stats.rating.toFixed(1)}
            <span className="block text-[10px] text-slate-500">({service.stats.ratingCount})</span>
          </div>
        </div>

        {(service.certificates && service.certificates.length > 0) && (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-200">
            {service.certificates.slice(0, 2).map((badge, idx) => (
              <span key={`${badge}-${idx}`} className="rounded-full bg-slate-800 px-2 py-1">
                {badge}
              </span>
            ))}
            {service.certificates.length > 2 && (
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-400">
                +{service.certificates.length - 2}
              </span>
            )}
          </div>
        )}

        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            {service.tags.slice(0, 2).map((tag, idx) => (
              <span key={`${tag}-${idx}`} className="rounded-full border border-slate-700 px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex gap-3">
            <span>👁 {service.stats.views}</span>
            <span>❤️ {service.stats.likes}</span>
            <span>🔖 {service.stats.saves}</span>
          </div>
          <Link
            href={`/services/${service.id}`}
            className="rounded-full bg-emerald-400/90 px-3 py-1 text-[11px] font-semibold text-slate-950"
          >
            {t("services.card.view")}
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onLike(service.id, !service.liked)}
            className={`rounded-full px-3 py-1 ${
              service.liked ? "bg-rose-500/20 text-rose-200" : "bg-slate-900 text-slate-300"
            }`}
          >
            {service.liked ? t("services.card.liked") : t("services.card.like")}
          </button>
          <button
            type="button"
            onClick={() => onSave(service.id, !service.saved)}
            className={`rounded-full px-3 py-1 ${
              service.saved ? "bg-sky-500/20 text-sky-200" : "bg-slate-900 text-slate-300"
            }`}
          >
            {service.saved ? t("services.card.saved") : t("services.card.save")}
          </button>
          <button
            type="button"
            className="rounded-full bg-slate-900 px-3 py-1 text-slate-300"
          >
            {t("services.card.share")}
          </button>
        </div>
      </div>
    </div>
  );
}
