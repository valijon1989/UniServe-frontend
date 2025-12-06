"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { client } from "@/api/client";

type Item = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  image?: string;
  banner?: string;
  description?: string;
  agent?: { name?: string };
  rating?: number;
  likes?: number;
  views?: number;
  orders?: number;
};

type ApiResponse = {
  items?: Item[];
  totalPages?: number;
  data?: {
    items?: Item[];
    totalPages?: number;
  };
};

function normalizeResponse(res: ApiResponse) {
  const items = res.items || res.data?.items || [];
  const totalPages = res.totalPages || res.data?.totalPages || 1;
  return { items, totalPages };
}

interface SectionState {
  items: Item[];
  totalPages: number;
  loading: boolean;
  error: string | null;
  page: number;
}

const emptyState: SectionState = {
  items: [],
  totalPages: 1,
  loading: false,
  error: null,
  page: 1
};

export function TrendingShowcase() {
  const [products, setProducts] = useState<SectionState>(emptyState);
  const [services, setServices] = useState<SectionState>(emptyState);

  const loadItems = async (kind: "products" | "services", page: number) => {
    const setter = kind === "products" ? setProducts : setServices;
    setter((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await client.get<ApiResponse>(`/${kind}/trending?page=${page}&limit=9`);
      const normalized = normalizeResponse(data);
      setter({
        items: normalized.items,
        totalPages: Math.max(1, normalized.totalPages || 1),
        loading: false,
        error: null,
        page
      });
    } catch (err: any) {
      setter({
        items: [],
        totalPages: 1,
        loading: false,
        error: err?.message || "Ma'lumotlarni yuklab bo'lmadi",
        page
      });
    }
  };

  useEffect(() => {
    void loadItems("products", 1);
    void loadItems("services", 1);
  }, []);

  const productGrid = useMemo(
    () =>
      products.items.map((item) => ({
        key: item._id || item.id || item.name,
        name: item.name || item.title || "Nomsiz mahsulot",
        agent: item.agent?.name || "Agent ma'lum emas",
        image: item.image || item.banner || "/placeholder.png",
        rating: item.rating ?? 0,
        likes: item.likes ?? 0,
        views: item.views ?? 0,
        orders: item.orders ?? 0,
        href: item._id || item.id ? `/products/${item._id || item.id}` : "#"
      })),
    [products.items]
  );

  const serviceGrid = useMemo(
    () =>
      services.items.map((item) => ({
        key: item._id || item.id || item.name,
        name: item.name || item.title || "Nomsiz xizmat",
        agent: item.agent?.name || "Ijrochi ma'lum emas",
        image: item.image || item.banner || "/placeholder.png",
        rating: item.rating ?? 0,
        likes: item.likes ?? 0,
        views: item.views ?? 0,
        orders: item.orders ?? 0,
        description: item.description,
        href: item._id || item.id ? `/services/${item._id || item.id}` : "#"
      })),
    [services.items]
  );

  const renderGrid = (
    items: typeof productGrid,
    loading: boolean,
    error: string | null,
    emptyText: string
  ) => (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading && (
        <p className="text-sm text-slate-400">Yuklanmoqda...</p>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-400">{emptyText}</p>
      )}
      {items.map((item) => (
        <Link
          href={item.href}
          key={item.key}
          className="group relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-sky-500/60"
        >
          <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/60">
            <img
              src={item.image}
              alt={item.name}
              className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>
          <div className="mt-[10px] space-y-2 flex-1">
            <h3 className="line-clamp-2 text-base md:text-lg font-semibold text-slate-100">
              {item.name}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-1">
              {item.agent}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] md:text-sm text-slate-300">
            <span className="rounded-full bg-slate-900/70 px-2 py-0.5">* {item.rating.toFixed(1)}</span>
            <span>Like {item.likes}</span>
            <span>Views {item.views}</span>
            <span>Orders {item.orders}</span>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderPagination = (
    total: number,
    page: number,
    onChange: (value: number) => void
  ) => {
    const canPrev = page > 1;
    const canNext = page < total;
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-200">
        <button
          type="button"
          onClick={() => canPrev && onChange(page - 1)}
          disabled={!canPrev}
          className="rounded-lg border border-slate-800 px-3 py-1 disabled:opacity-40"
        >
          Oldingi
        </button>
        <span>
          {page} / {total}
        </span>
        <button
          type="button"
          onClick={() => canNext && onChange(page + 1)}
          disabled={!canNext}
          className="rounded-lg border border-slate-800 px-3 py-1 disabled:opacity-40"
        >
          Keyingi
        </button>
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-black/30">
      <div className="mb-6 space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-sky-500/40">
          Trend
        </p>
        <h2 className="text-2xl font-bold text-slate-100">
          Trenddagi mahsulot va xizmatlar
        </h2>
        <p className="text-sm text-slate-400">
          Reyting, layklar, xarid va ko'rishlar soniga ko'ra saralangan.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              Trend Products
            </h3>
            {renderPagination(products.totalPages, products.page, (val) => void loadItems("products", val))}
          </div>
          {renderGrid(productGrid, products.loading, products.error, "Mahsulotlar topilmadi.")}
        </div>

        <div className="border-t border-slate-800 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              Trend Services
            </h3>
            {renderPagination(services.totalPages, services.page, (val) => void loadItems("services", val))}
          </div>
          {renderGrid(serviceGrid, services.loading, services.error, "Xizmatlar topilmadi.")}
        </div>
      </div>
    </section>
  );
}
