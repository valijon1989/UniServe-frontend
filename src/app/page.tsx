"use client";

import { useEffect, useState } from "react";
import { getFeed, type FeedItem } from "@/api/feed";
import { FeedCard } from "@/components/FeedCard";
import { useI18n } from "@/context/i18n";

export default function HomePage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

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
    <div className="space-y-4">
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
          {items.map((item) => (
            <FeedCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
