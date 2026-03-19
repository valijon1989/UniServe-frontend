"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/context/i18n";
import ProductCard from "@/components/ProductCard";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  toProductCardProps,
  toServiceCardProps,
  type NormalizedListing
} from "@/lib/normalizeListing";

type Props = {
  saleProducts: NormalizedListing[];
  saleServices: NormalizedListing[];
  dealsCount: number;
};

export function EventsSection({ saleProducts, saleServices, dealsCount }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [compareCards, setCompareCards] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (typeof window === "undefined") return;
    const enabled = new URLSearchParams(window.location.search).get("compareCards") === "1";
    setCompareCards(enabled);
  }, []);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = scope.querySelectorAll<HTMLElement>("[data-lag]");
      cards.forEach((card) => {
        const lag = parseFloat(card.dataset.lag || "0");
        const shift = Math.min(1, Math.abs(lag) / 0.2) * 60; // px chegarasi
        const direction = Math.sign(lag) || 1;

        gsap.fromTo(
          card,
          { y: -shift * direction },
          {
            y: shift * direction,
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });
    }, scope);

    return () => {
      ctx.revert();
    };
  }, []);

  const noopServiceAction = (_id: string, _next: boolean) => undefined;

  const renderOriginalListingCard = (item: NormalizedListing) => {
    if (item.type === "product") {
      return <ProductCard data={toProductCardProps(item)} />;
    }
    if (item.type === "service") {
      return (
        <ServiceCard
          service={toServiceCardProps(item)}
          onLike={noopServiceAction}
          onSave={noopServiceAction}
        />
      );
    }
    return null;
  };

  const isOnSale = (item: NormalizedListing) =>
    item.isOnSale === true ||
    item.isSale === true ||
    (item.salePrice != null &&
      item.price != null &&
      Number(item.salePrice) < Number(item.price)) ||
    Number(item.discountPercent || 0) > 0;

  const toTimestamp = (value?: string) => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const pickVisibleCards = (items: NormalizedListing[]) => {
    const saleItems = items.filter(isOnSale);
    if (saleItems.length > 0) return saleItems.slice(0, 3);

    return [...items]
      .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
      .slice(0, 3)
      .map((item) => {
        const normalizedPrice = item.salePrice > 0 ? item.salePrice : item.price;
        return {
          ...item,
          price: normalizedPrice,
          salePrice: normalizedPrice,
          discountPercent: 0,
          isOnSale: false,
          isSale: false
        };
      });
  };

  const hasAnyDeals = dealsCount > 0;

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/30 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200">
            {t({ en: "Events", uz: "Aksiyalar", ru: "Акции", ko: "이벤트" })}
          </p>
          <h3 className="text-2xl font-bold text-slate-50">
            {t({
              en: "Discounted products and services",
              uz: "Chegirmadagi mahsulotlar va xizmatlar",
              ru: "Товары и услуги со скидкой",
              ko: "할인 중인 상품과 서비스"
            })}
          </h3>
          <p className="text-sm text-slate-400">
            {t({
              en: "Special offers inside Sale Product and Sale Service blocks.",
              uz: "Sale Product va Sale Service bloklarida maxsus takliflar.",
              ru: "Специальные предложения в блоках Sale Product и Sale Service.",
              ko: "Sale Product 및 Sale Service блок에 특별한 혜택이 있습니다."
            })}
          </p>
          {compareCards && (
            <p className="mt-2 text-xs text-sky-300">Compare mode: ON (`?compareCards=1`)</p>
          )}
        </div>
      </div>

      <div ref={ref} className="grid gap-4 md:grid-cols-2 items-start">
        {[
          { kind: "product", tone: "amber", data: saleProducts, baseLag: 0 },
          { kind: "service", tone: "emerald", data: saleServices, baseLag: 0 }
        ].map((block) => {
          const visibleItems = pickVisibleCards(block.data);
          const hasSaleInBlock = block.data.some(
            (item) => isOnSale(item)
          );

          return (
            <div
              key={block.kind}
              className="min-w-0 self-start h-auto space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-50">
                  {block.kind === "service"
                    ? hasSaleInBlock
                      ? t({ en: "Sale Service", uz: "Chegirma xizmati", ru: "Услуга со скидкой", ko: "할인 서비스" })
                      : t({ en: "Latest Service", uz: "Yangi xizmat", ru: "Новая услуга", ko: "최신 서비스" })
                    : hasSaleInBlock
                      ? t({ en: "Sale Product", uz: "Chegirma mahsulot", ru: "Товар со скидкой", ko: "할인 상품" })
                      : t({ en: "Latest Product", uz: "Yangi mahsulot", ru: "Новый товар", ko: "최신 상품" })}
                </h4>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    block.tone === "amber"
                      ? "bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/40"
                  }`}
                >
                  {hasSaleInBlock
                    ? t({ en: "Discount", uz: "Chegirma", ru: "Скидка", ko: "할인" })
                    : t({ en: "Latest", uz: "Yangi", ru: "Новое", ko: "최신" })}
                </span>
              </div>

              <div className="flex flex-col gap-3 items-stretch justify-start">
                {visibleItems.length === 0 && !hasAnyDeals ? (
                  <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
                    {t({
                      en: "No discounted items available yet.",
                      uz: "Hozircha chegirmadagi ma'lumotlar topilmadi.",
                      ru: "Пока нет товаров или услуг со скидкой.",
                      ko: "현재 할인 항목이 없습니다."
                    })}
                  </div>
                ) : (
                  visibleItems.map((item, idx) => {
                    return (
                      <div key={item.id ?? item._id} data-lag={(block.baseLag + idx * 0.0).toFixed(2)} className="event-card">
                        {compareCards ? (
                          <div className="grid gap-3 xl:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Home card</p>
                              {renderOriginalListingCard(item)}
                            </div>
                            <div className="space-y-2">
                              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Listing card</p>
                              {renderOriginalListingCard(item)}
                            </div>
                          </div>
                        ) : (
                          renderOriginalListingCard(item)
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
