"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/context/i18n";
import { ListingCard } from "@/components/listing/ListingCard";

export type EventItem = {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice: number;
  off: number;
  tag: string;
  kind?: "product" | "service";
  href?: string;
  image?: string;
  coverImageUrl?: string;
  images?: string[];
};

type Props = {
  saleProducts: EventItem[];
  saleServices: EventItem[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const normalizeCoverImageUrl = (value?: string) => {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value.replace(/^\/+/, "")}`;
};

export function EventsSection({ saleProducts, saleServices }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let mounted = true;

    const setup = async () => {
      const gsap = (await import("gsap")).default;
      const ScrollTrigger = (await import("gsap/ScrollTrigger")).default;
      const scope = ref.current;

      if (!mounted || !scope) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
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
    };

    setup();

    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

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
        </div>
      </div>

      <div ref={ref} className="grid gap-4 md:grid-cols-2 items-start">
        {[
          { kind: "product", tone: "amber", data: saleProducts, baseLag: 0 },
          { kind: "service", tone: "emerald", data: saleServices, baseLag: 0 }
        ].map((block) => (
          <div
            key={block.kind}
            className="min-w-0 self-start h-auto space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-50">
                {block.kind === "service"
                  ? t({ en: "Sale Service", uz: "Chegirma xizmati", ru: "Услуга со скидкой", ko: "할인 서비스" })
                  : t({ en: "Sale Product", uz: "Chegirma mahsulot", ru: "Товар со скидкой", ko: "할인 상품" })}
              </h4>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  block.tone === "amber"
                    ? "bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/40"
                }`}
              >
                {t({ en: "Discount", uz: "Chegirma", ru: "Скидка", ko: "할인" })}
              </span>
            </div>

            <div className="flex flex-col gap-3 items-stretch justify-start">
              {block.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
                  {t({
                    en: "No discounted items available yet.",
                    uz: "Hozircha chegirmadagi ma'lumotlar topilmadi.",
                    ru: "Пока нет товаров или услуг со скидкой.",
                    ko: "현재 할인 항목이 없습니다."
                  })}
                </div>
              ) : (
                block.data.map((item, idx) => {
                  const isService = block.kind === "service";
                  const imageSource = item.image || item.coverImageUrl || item.images?.[0];
                  const imageSrc = normalizeCoverImageUrl(imageSource);
                  const href =
                    item.href || (isService ? `/services/${item.id}` : `/products/${item.id}`);
                  return (
                    <div key={item.id} data-lag={(block.baseLag + idx * 0.0).toFixed(2)} className="event-card">
                      <ListingCard
                        compact
                        item={{
                          _id: item.id,
                          type: block.kind as "product" | "service",
                          title: item.title,
                          category: item.category,
                          price: item.price,
                          oldPrice: item.oldPrice,
                          off: item.off,
                          tag: item.tag,
                          href,
                          coverImageUrl: imageSrc,
                          images: imageSrc ? [imageSrc] : [],
                          stats: { likes: 0, views: 0, orders: 0 }
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
