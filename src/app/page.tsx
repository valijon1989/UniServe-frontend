"use client";

import { useEffect, useMemo, useState } from "react";
import { getFeed, type FeedItem } from "@/api/feed";
import { FeedCard } from "@/components/FeedCard";
import { useI18n } from "@/context/i18n";

export default function HomePage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  const heroSlides = useMemo(
    () => [
      {
        title: t("home.hero.slide.products.title"),
        desc: t("home.hero.slide.products.desc"),
        badge: t("home.hero.slide.products.badge"),
        image: "https://images.unsplash.com/photo-1542293787938-4d273c37b00c?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.services.title"),
        desc: t("home.hero.slide.services.desc"),
        badge: t("home.hero.slide.services.badge"),
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.community.title"),
        desc: t("home.hero.slide.community.desc"),
        badge: t("home.hero.slide.community.badge"),
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.agents.title"),
        desc: t("home.hero.slide.agents.desc"),
        badge: t("home.hero.slide.agents.badge"),
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.feed.title"),
        desc: t("home.hero.slide.feed.desc"),
        badge: t("home.hero.slide.feed.badge"),
        image: "https://images.unsplash.com/photo-1527443224154-d777c966ebb5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    [t]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getFeed();
        setItems(data);
      } catch (err) {
        console.error("Feed error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-sky-900/50 via-slate-900/70 to-amber-900/40 p-8 shadow-2xl shadow-black/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_bottom,_rgba(248,113,113,0.12),transparent_40%)]" />
        <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-sky-500/30">
              {t("home.hero.platform")}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
              {t("home.hero.title")}
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              {t("home.hero.description")}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 ring-1 ring-sky-500/40">
                {t("home.hero.tag.search")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/40">
                {t("home.hero.tag.verified")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 ring-1 ring-amber-500/40">
                {t("home.hero.tag.community")}
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-xl">
            <div className="marquee-track">
              {[...heroSlides, ...heroSlides].map((slide, idx) => (
                <div
                  key={`${slide.title}-${idx}`}
                  className="relative min-w-[220px] min-h-[180px] overflow-hidden rounded-xl border border-slate-600/70 bg-gradient-to-b from-slate-900/60 via-slate-950/60 to-black/70 px-4 py-5 shadow-lg shadow-black/25"
                >
                  <div className="absolute inset-0">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover opacity-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />
                  </div>
                  <div className="relative">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                      {slide.badge}
                    </div>
                    <p className="text-lg font-semibold text-slate-100">{slide.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <h1 className="text-lg font-semibold text-slate-50">
          {t("home.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t("home.subtitle")}
        </p>
      </section>

      {loading ? (
        <p className="text-sm text-slate-400">{t("home.loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">
          {t("home.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <FeedCard key={item.id || item._id || idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
