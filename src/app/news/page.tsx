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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

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

  const curatedCategories = [
    "Texnologiya",
    "Marketing",
    "Logistika",
    "Ta'lim",
    "Servis va ta'mirlash",
    "Dizayn & kreativ",
    "Moliyaviy xizmatlar",
    "Huquqiy maslahat",
    "E-commerce",
    "Language teaching",
    "Translation",
    "Delivery",
    "Camera"
  ];

  const productCategories = [
    "Oziq-ovqat",
    "Kiyim-kechak",
    "Elektronika",
    "Avtomobil",
    "Maishiy uskunalar",
    "Sport",
    "Aksessuarlar",
    "Go‘zallik",
    "Boshqa"
  ];

  const serviceCategories = [
    "IT & Dasturlash",
    "Dizayn & kreativ",
    "Marketing & SMM",
    "Ta'lim & mentoring",
    "Yuridik xizmatlar",
    "Moliyaviy & buxgalteriya",
    "Logistika & yetkazib berish",
    "Qurilish & ta'mirlash",
    "Sog‘liq va fitnes",
    "Boshqa"
  ];

  const categories = useMemo(() => {
    const cats = new Set<string>(curatedCategories);
    news.forEach((item) => {
      if (item.kind === "post" && ((item as FeedItem).category || (item as FeedItem).type)) {
        cats.add((item as FeedItem).category || (item as FeedItem).type || "");
      }
      if ((item as TrendProduct | TrendService).category) {
        cats.add((item as TrendProduct | TrendService).category as string);
      }
    });
    return ["all", ...Array.from(cats).filter(Boolean)];
  }, [news, curatedCategories]);

  const filtered = useMemo(() => {
    const byType =
      active === "all"
        ? news
        : active === "posts"
          ? news.filter((item) => item.kind === "post")
          : news.filter((item) => item.kind === active.slice(0, -1));

    const byCategory =
      categoryFilter === "all"
        ? byType
        : byType.filter((item) => {
          if (item.kind === "post") {
            const post = item as FeedItem;
            return post.category === categoryFilter || post.type === categoryFilter;
          }
          return (item as TrendProduct | TrendService).category === categoryFilter;
        });

    if (!search.trim()) {
      return active === "all"
        ? [...byCategory].sort((a, b) => {
            const priority = { product: 0, service: 1, post: 2 } as const;
            const pa = priority[a.kind];
            const pb = priority[b.kind];
            if (pa !== pb) return pa - pb;
            const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
            const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
            return db - da;
          })
        : byCategory;
    }
    const term = search.trim().toLowerCase();
    const matchesSearch = (item: NewsItem) => {
      if (item.kind === "post") {
        const post = item as FeedItem;
        return [
          post.content,
          post.text,
          post.category,
          post.type,
          post.author?.name
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(term));
      }
      const cast = item as TrendProduct | TrendService;
      return [
        cast.title,
        cast.description,
        cast.category,
        cast.createdBy?.name,
        cast.createdBy?.username
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term));
    };

    const searched = byCategory.filter(matchesSearch);
    if (active !== "all") return searched;
    return [...searched].sort((a, b) => {
      const priority = { product: 0, service: 1, post: 2 } as const;
      const pa = priority[a.kind];
      const pb = priority[b.kind];
      if (pa !== pb) return pa - pb;
      const da = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const db = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return db - da;
    });
  }, [news, active, categoryFilter, search]);

  const filteredCount = filtered.length;

  const placeholder = useMemo(() => {
    const base = "Qidiruv: mahsulot, xizmat yoki post...";
    if (active === "products") return "Mahsulot nomi yoki kategoriya...";
    if (active === "services") return "Xizmat nomi yoki yo‘nalish...";
    if (active === "posts") return "Post matni, kategoriya yoki muallif...";
    return base;
  }, [active]);

  useEffect(() => {
    if (active === "products") return;
    if (active === "services" && serviceCategories.includes(categoryFilter)) return;
    if (active === "posts") return;
    if (active !== "products" && active !== "services" && active !== "posts" && categoryFilter !== "all") {
      setCategoryFilter("all");
    }
  }, [active, categoryFilter, serviceCategories]);

  const tabList: { key: NewsType; label: string }[] = [
    { key: "all", label: "Barchasi" },
    { key: "products", label: "Mahsulotlar" },
    { key: "services", label: "Xizmatlar" },
    { key: "posts", label: "Yangiliklar" }
  ];

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Yaqinda";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Hozirgina";
    if (diffMin < 60) return `${diffMin} daqiqa avval`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} soat avval`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} kun avval`;
    return date.toLocaleDateString("uz-UZ");
  };

  const renderItem = (item: NewsItem) => {
    if (item.kind === "product" || item.kind === "service") {
      const href = item.kind === "product" ? `/products/${item.id}` : `/services/${item.id}`;
      return (
        <Link
          key={item.id}
          href={href}
          className="group flex flex-col gap-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:border-sky-500/60"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/70 text-lg">
              {item.kind === "product" ? "🛍️" : "🛠️"}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                  {item.kind === "product" ? "Mahsulot" : "Xizmat"}
                </span>
                {item.category && (
                  <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                    {item.category}
                  </span>
                )}
                <span>{formatTimeAgo((item as any).createdAt)}</span>
              </div>
              <p className="text-base font-semibold text-slate-50">{item.title}</p>
              <p className="line-clamp-2 text-sm text-slate-300">
                {item.description || "Tavsif kiritilmagan."}
              </p>
              <div className="flex flex-wrap gap-2 text-[12px] text-slate-200">
                {item.price && (
                  <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                    {item.price} {item.currency || "UZS"}
                  </span>
                )}
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                  {item.orders ?? 0} buyurtma
                </span>
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
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
        className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/25"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 text-sky-100">
            📰
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-400">
              <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                Post
              </span>
              {(post.type || post.category) && (
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                  {post.type || post.category}
                </span>
              )}
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
            <p className="line-clamp-3 text-base font-semibold text-slate-100">
              {post.content || post.text || "Yangilik"}
            </p>
            <div className="flex items-center justify-between text-[12px] text-slate-300">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                  ❤️ {post.likesCount ?? 0}
                </span>
                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 ring-1 ring-slate-800">
                  💬 {post.commentsCount ?? 0}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {(post.author && post.author.name) || "Foydalanuvchi"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-black/30">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/images/news/header.jpg)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-200 drop-shadow">News & Lenta</p>
            <h1 className="text-3xl font-bold text-slate-50 drop-shadow">Eng so‘nggi mahsulotlar, xizmatlar va postlar</h1>
            <p className="mt-2 text-sm text-slate-100 drop-shadow">
              Barcha kategoriyalar bo‘yicha instaga o‘xshash lenta: yangiliklar, e’lonlar va servislar bir oqimda.
            </p>
          </div>
          {loading && <span className="text-xs text-slate-100 drop-shadow">Yuklanmoqda...</span>}
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Qidiruv</p>
            <p className="text-sm text-slate-300">
              Istalgan yangilikni toping: mahsulot, xizmat yoki post matni bo‘yicha.
            </p>
          </div>
          <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-800">
            {filteredCount} natija
          </span>
        </div>
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 pl-11 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            🔎
          </span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filtrlar</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-50">Yangiliklar</p>
            </div>
            <p className="text-xs text-slate-400">
              Lenta formatini tanlang: mahsulot, xizmat yoki postlar oqimi.
            </p>
            <div className="flex flex-wrap gap-2">
              {tabList.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    active === tab.key
                      ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/50"
                      : "bg-slate-950/80 text-slate-200 ring-1 ring-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {active === "products" && (
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-slate-500">Mahsulot kategoriyalari</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", ...productCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      categoryFilter === cat
                        ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/50"
                        : "bg-slate-950/80 text-slate-200 ring-1 ring-slate-800"
                    }`}
                  >
                    {cat === "all" ? "Barchasi" : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === "services" && (
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-slate-500">Xizmat kategoriyalari</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", ...serviceCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      categoryFilter === cat
                        ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/50"
                        : "bg-slate-950/80 text-slate-200 ring-1 ring-slate-800"
                    }`}
                  >
                    {cat === "all" ? "Barchasi" : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === "posts" && (
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wide text-slate-500">Yangiliklar kategoriyalari</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", ...categories.filter((c) => c !== "all")].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      categoryFilter === cat
                        ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/50"
                        : "bg-slate-950/80 text-slate-200 ring-1 ring-slate-800"
                    }`}
                  >
                    {cat === "all" ? "Barchasi" : cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

        <div className="space-y-4">
          {filtered.length === 0 && !loading ? (
            <p className="text-sm text-slate-400">Hozircha ma’lumot yo‘q.</p>
          ) : (
            filtered.map((item) => renderItem(item))
          )}
        </div>
      </div>
    </div>
  );
}
