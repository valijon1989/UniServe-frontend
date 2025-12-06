"use client";

import { useEffect, useMemo, useState } from "react";
import { getFeed, type FeedItem } from "@/api/feed";
import { getLatestProducts, type TrendProduct } from "@/api/products";
import { getLatestServices, type TrendService } from "@/api/services";
import Link from "next/link";

type NewsType = "all" | "products" | "services" | "posts";

type NewsItem =
  | (FeedItem & { kind: "post" })
  | (TrendProduct & { kind: "product" })
  | (TrendService & { kind: "service" });

export default function NewsPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [products, setProducts] = useState<TrendProduct[]>([]);
  const [services, setServices] = useState<TrendService[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<NewsType>("all");

  useEffect(() => {
    (async () => {
      try {
        const [feedRes, prodRes, servRes] = await Promise.all([
          getFeed(),
          getLatestProducts(),
          getLatestServices()
        ]);
        setFeedItems(feedRes);
        setProducts(prodRes);
        setServices(servRes);
      } catch (err) {
        console.error("News load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const news: NewsItem[] = useMemo(() => {
    const posts: NewsItem[] = feedItems.map((item, idx) => ({
      ...item,
      id: item.id || item._id || `post-${idx}`,
      kind: "post"
    }));
    const prods: NewsItem[] = products.map((p, idx) => ({
      ...p,
      id: p.id || p._id || `product-${idx}`,
      kind: "product"
    }));
    const servs: NewsItem[] = services.map((s, idx) => ({
      ...s,
      id: s.id || s._id || `service-${idx}`,
      kind: "service"
    }));

    const combined = [...posts, ...prods, ...servs];
    return combined.sort((a, b) => {
      const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return db - da;
    });
  }, [feedItems, products, services]);

  const filtered = useMemo(() => {
    if (active === "all") return news;
    if (active === "posts") return news.filter((item) => item.kind === "post");
    return news.filter((item) => item.kind === active.slice(0, -1));
  }, [news, active]);

  const tabList: { key: NewsType; label: string }[] = [
    { key: "all", label: "Barchasi" },
    { key: "products", label: "Mahsulotlar" },
    { key: "services", label: "Xizmatlar" },
    { key: "posts", label: "Yangiliklar" }
  ];

  const renderItem = (item: NewsItem) => {
    if (item.kind === "product" || item.kind === "service") {
      const href = item.kind === "product" ? `/products/${item.id}` : `/services/${item.id}`;
      return (
        <Link
          key={item.id}
          href={href}
          className="group flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg transition hover:-translate-y-0.5 hover:border-sky-500/60"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/70 text-lg">
              {item.kind === "product" ? "🛍️" : "🛠️"}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="line-clamp-1 text-sm font-semibold text-slate-100">{item.title}</p>
              <p className="line-clamp-2 text-xs text-slate-400">
                {item.description || "Tavsif kiritilmagan."}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                {item.category && (
                  <span className="rounded-full bg-slate-900/60 px-2 py-0.5">{item.category}</span>
                )}
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5">
                  {item.orders ?? 0} buyurtma
                </span>
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5">
                  {item.views ?? 0} ko‘rish
                </span>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    const post = item as FeedItem & { kind: "post" };
    return (
      <div
        key={post.id || post._id}
        className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 text-sky-100">
            📰
          </div>
          <div className="min-w-0 space-y-1">
            <p className="line-clamp-2 text-sm font-semibold text-slate-100">
              {post.content || post.text || "Yangilik"}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {post.type || post.category || "post"}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="rounded-full bg-slate-900/60 px-2 py-0.5">
                ❤️ {post.likesCount ?? 0}
              </span>
              <span className="rounded-full bg-slate-900/60 px-2 py-0.5">
                💬 {post.commentsCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">News & Lenta</p>
            <h1 className="text-3xl font-bold text-slate-50">Eng so‘nggi mahsulotlar, xizmatlar va postlar</h1>
            <p className="mt-2 text-sm text-slate-400">
              Kategoriyalar bo‘yicha filtrlang va oxirgi yangiliklarni lenta shaklida ko‘ring.
            </p>
          </div>
          {loading && <span className="text-xs text-slate-300">Yuklanmoqda...</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabList.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                active === tab.key
                  ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/50"
                  : "bg-slate-900/60 text-slate-200 ring-1 ring-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {filtered.length === 0 && !loading ? (
        <p className="text-sm text-slate-400">Hozircha ma’lumot yo‘q.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => renderItem(item))}
        </div>
      )}
    </div>
  );
}
