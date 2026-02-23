"use client";

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/api/client";
import { getLatestProducts } from "@/api/products";
import { getLatestServices } from "@/api/services";

type TopItem = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  category?: string;
  image?: string;
  banner?: string;
  orders?: number;
  views?: number;
  likes?: number;
  currency?: string;
  price?: number;
};

type ApiResponse = {
  items?: TopItem[];
  data?: {
    items?: TopItem[];
  };
};

function normalizeItems(res: ApiResponse) {
  return res.items || res.data?.items || [];
}

const mapLatestProductToTop = (item: any, idx: number): TopItem => ({
  _id: item._id,
  id: item.id || item._id || `latest-product-${idx}`,
  title: item.title || item.name || "Mahsulot",
  category: item.category,
  image: item.thumbnail || item.coverImageUrl || item.images?.[0],
  orders: item.stats?.purchases ?? item.orders ?? item.purchases ?? 0,
  views: item.stats?.views ?? item.views ?? 0,
  likes: item.stats?.likes ?? item.likes ?? 0,
  currency: item.currency,
  price: item.price
});

const mapLatestServiceToTop = (item: any, idx: number): TopItem => ({
  _id: item._id,
  id: item.id || item._id || `latest-service-${idx}`,
  title: item.title || item.name || "Xizmat",
  category: item.category,
  image: item.coverImageUrl || item.images?.[0],
  orders: item.orders ?? 0,
  views: item.views ?? 0,
  likes: item.likes ?? 0,
  currency: item.currency,
  price: item.hourlyRate ?? item.price
});

const medal = ["🥇", "🥈", "🥉"];
const medalBg = [
  "from-amber-500/30 via-amber-400/20 to-amber-600/30",
  "from-slate-300/30 via-slate-200/20 to-slate-400/30",
  "from-amber-900/30 via-amber-800/20 to-amber-900/40"
];

export function TopPodium() {
  const [products, setProducts] = useState<TopItem[]>([]);
  const [services, setServices] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, servRes, latestProducts, latestServices] = await Promise.all([
          client.get<ApiResponse>("/products/trending?limit=3&page=1"),
          client.get<ApiResponse>("/services/trending?limit=3&page=1"),
          getLatestProducts(),
          getLatestServices()
        ]);
        const trendingProducts = normalizeItems(prodRes.data);
        const trendingServices = normalizeItems(servRes.data);

        const fallbackProducts = (latestProducts || []).slice(0, 3).map(mapLatestProductToTop);
        const fallbackServices = (latestServices || []).slice(0, 3).map(mapLatestServiceToTop);

        setProducts(trendingProducts.length > 0 ? trendingProducts : fallbackProducts);
        setServices(trendingServices.length > 0 ? trendingServices : fallbackServices);
      } catch (err: any) {
        setError(err?.message || "Podiumni yuklab bo'lmadi");
        try {
          const [latestProducts, latestServices] = await Promise.all([
            getLatestProducts(),
            getLatestServices()
          ]);
          setProducts((latestProducts || []).slice(0, 3).map(mapLatestProductToTop));
          setServices((latestServices || []).slice(0, 3).map(mapLatestServiceToTop));
        } catch {
          setProducts([]);
          setServices([]);
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const buildHref = (item: TopItem, tone: "amber" | "emerald") => {
    const id = item._id || item.id;
    if (!id) return "#";
    return tone === "amber" ? `/products/${id}` : `/services/${id}`;
  };

  const renderPodium = (items: TopItem[], tone: "amber" | "emerald") => {
    const podiumItems = items.slice(0, 3);
    // Display order: 2-o'rin (chap), 1-o'rin (markaz), 3-o'rin (o'ng)
    const order = [1, 0, 2];
    const heights = [320, 320, 320]; // bir xil balandlik (yanada keng joy)

    return (
      <div className="flex items-start gap-2 md:gap-3">
        {order.map((rankIdx, visualIdx) => {
          const item = podiumItems[rankIdx];
          if (!item) {
            return (
              <div
                key={`empty-${visualIdx}`}
                style={{ height: heights[rankIdx], minWidth: 0 }}
                className="flex-1 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-3 text-center text-xs text-slate-500"
              >
                Bo'sh
              </div>
            );
          }

          return (
            <div
              key={item._id || item.id || rankIdx}
              style={{ minHeight: heights[rankIdx], height: heights[rankIdx], minWidth: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="mb-2 flex items-center justify-center gap-2 px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/90 text-lg shadow-inner shadow-black/40 ring-2 ring-slate-800">
                  {medal[rankIdx]}
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  {["Gold", "Silver", "Bronze"][rankIdx]}
                </span>
              </div>
              <Link
                href={buildHref(item, tone)}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80 p-3 shadow-lg shadow-black/25 transition hover:-translate-y-1 hover:border-sky-500/60"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${medalBg[rankIdx]}`} />
                <div className="relative mt-3 flex flex-col gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm md:text-base font-semibold text-slate-100">
                      {item.title || item.name || "Nom berilmagan"}
                    </p>
                    <p className="truncate text-[11px] md:text-xs text-slate-300">
                      {item.category || (tone === "amber" ? "Mahsulot" : "Xizmat")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] md:text-[12px] text-slate-200">
                    <span className="rounded-full bg-slate-900/70 px-2 py-0.5">Orders: {item.orders ?? 0}</span>
                    <span className="rounded-full bg-slate-900/70 px-2 py-0.5">Views: {item.views ?? 0}</span>
                    <span className="rounded-full bg-slate-900/70 px-2 py-0.5">Likes: {item.likes ?? 0}</span>
                    {item.price !== undefined && (
                      <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
                        {item.price} {item.currency || "USD"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative mt-3 flex gap-2 text-[11px] text-sky-200 opacity-0 transition group-hover:opacity-100">
                  <span className="rounded-md border border-slate-700 px-2 py-1">Batafsil</span>
                  <span className="rounded-md border border-slate-700 px-2 py-1">Savol berish</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/25">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Top podium</p>
          <h2 className="text-2xl font-bold text-slate-50">
            Haftalik top mahsulotlar va xizmatlar
          </h2>
          <p className="text-sm text-slate-400">
            Sotuvlar va xizmatlardan foydalanish ko'rsatkichlariga ko'ra yangilanadi.
          </p>
        </div>
        {loading && (
          <span className="text-xs text-slate-300">Yuklanmoqda...</span>
        )}
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-500/40">
              Top Products
            </span>
          </div>
          {renderPodium(products, "amber")}
          {products.length === 0 && !loading && !error && (
            <p className="text-sm text-slate-400">Top mahsulotlar hali yo'q.</p>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/40">
              Top Services
            </span>
          </div>
          {renderPodium(services, "emerald")}
          {services.length === 0 && !loading && !error && (
            <p className="text-sm text-slate-400">Top xizmatlar hali yo'q.</p>
          )}
        </div>
      </div>
    </section>
  );
}
