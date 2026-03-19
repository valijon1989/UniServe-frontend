"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { ServiceListItem } from "@/lib/servicesTypes";
import { useI18n } from "@/context/i18n";
import {
  ArrowUpRightIcon,
  BookmarkIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon
} from "@/components/listing/ListingActionIcons";
import { getServiceImageUrl } from "@/lib/serviceImage";
import { normalizeMarketplaceTitle } from "@/lib/marketplaceNaming";
import { Avatar } from "@/components/ui/Avatar";

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
  const serviceTitle = normalizeMarketplaceTitle(service.title, t("services.list.title"));
  const viewActionLabel = t("services.card.view");
  const likeActionLabel = service.liked ? t("services.card.liked") : t("services.card.like");
  const saveActionLabel = service.saved ? t("services.card.saved") : t("services.card.save");
  const shareActionLabel = t("services.card.share");

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

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const url = `${window.location.origin}/services/${service.id}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: serviceTitle, text: serviceTitle, url });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(
          t({
            en: "Service link copied",
            uz: "Xizmat havolasi nusxalandi",
            ru: "Ссылка на услугу скопирована",
            ko: "서비스 링크가 복사되었습니다"
          })
        );
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    toast.error(
      t({
        en: "Could not share the service right now.",
        uz: "Xizmatni hozir ulashib bo'lmadi.",
        ru: "Сейчас не удалось поделиться услугой.",
        ko: "지금은 서비스를 공유할 수 없습니다."
      })
    );
  };

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
            alt={serviceTitle}
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
            <p className="text-sm font-semibold text-slate-100">{serviceTitle}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <Avatar
                src={service.provider.avatarUrl}
                alt={service.provider.name}
                fallbackText={service.provider.name}
                size={24}
                className="border border-slate-700/70"
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
            <span className="inline-flex items-center gap-1.5">
              <EyeIcon className="h-3.5 w-3.5" />
              {service.stats.views}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HeartIcon className="h-3.5 w-3.5" filled />
              {service.stats.likes}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookmarkIcon className="h-3.5 w-3.5" filled />
              {service.stats.saves}
            </span>
          </div>
          <Link
            href={`/services/${service.id}`}
            aria-label={viewActionLabel}
            title={viewActionLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/90 text-slate-950 transition hover:bg-emerald-300"
          >
            <ArrowUpRightIcon className="h-4.5 w-4.5" />
            <span className="sr-only">{viewActionLabel}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onLike(service.id, !service.liked)}
            aria-label={likeActionLabel}
            aria-pressed={service.liked}
            title={likeActionLabel}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              service.liked
                ? "border-rose-400/50 bg-rose-500/20 text-rose-200"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-rose-400/40 hover:text-rose-200"
            }`}
          >
            <HeartIcon className="h-4.5 w-4.5" filled={service.liked} />
            <span className="sr-only">{likeActionLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => onSave(service.id, !service.saved)}
            aria-label={saveActionLabel}
            aria-pressed={service.saved}
            title={saveActionLabel}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              service.saved
                ? "border-sky-400/50 bg-sky-500/20 text-sky-200"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:border-sky-400/40 hover:text-sky-200"
            }`}
          >
            <BookmarkIcon className="h-4.5 w-4.5" filled={service.saved} />
            <span className="sr-only">{saveActionLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            aria-label={shareActionLabel}
            title={shareActionLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-200"
          >
            <ShareIcon className="h-4.5 w-4.5" />
            <span className="sr-only">{shareActionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
