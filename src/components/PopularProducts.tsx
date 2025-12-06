"use client";

import { useEffect, useMemo, useState } from "react";
import { client } from "@/api/client";

interface Agent {
  name?: string;
}

interface Product {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
  agent?: Agent;
  likes?: number;
  views?: number;
  orders?: number;
}

interface PopularResponse {
  items?: Product[];
  data?: {
    items?: Product[];
    totalPages?: number;
  };
  totalPages?: number;
}

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (pageValue: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get<PopularResponse>(`/products/popular?page=${pageValue}&limit=8`);
      const fromItems = data.items || data.data?.items || [];
      setProducts(fromItems);
      setTotalPages(data.totalPages || data.data?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts(page);
  }, [page]);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < totalPages, [page, totalPages]);

  return (
    <div className="mt-10 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading && <p className="text-sm text-slate-400">Yuklanmoqda...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-sm text-slate-400">Mahsulotlar topilmadi.</p>
        )}

        {products.map((p) => (
          <div
            key={p._id || p.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-lg shadow-black/30"
          >
            <div className="overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/60">
              <img
                src={p.image || "/placeholder.png"}
                alt={p.name || "Mahsulot"}
                className="h-40 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-100 line-clamp-1">
              {p.name || "Nomsiz mahsulot"}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {p.agent?.name || "Agent ma'lum emas"}
            </p>
            <div className="mt-2 flex gap-3 text-xs text-slate-300">
              <span>Like {p.likes ?? 0}</span>
              <span>Views {p.views ?? 0}</span>
              <span>Orders {p.orders ?? 0}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => canPrev && setPage((prev) => prev - 1)}
          disabled={!canPrev}
          className="rounded-lg border border-slate-800 px-3 py-1 text-sm text-slate-100 disabled:opacity-50"
        >
          Oldingi
        </button>
        <span className="text-sm text-slate-300">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => canNext && setPage((prev) => prev + 1)}
          disabled={!canNext}
          className="rounded-lg border border-slate-800 px-3 py-1 text-sm text-slate-100 disabled:opacity-50"
        >
          Keyingi
        </button>
      </div>
    </div>
  );
}
