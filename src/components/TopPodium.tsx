"use client";

import { useEffect, useState } from "react";
import { client } from "@/api/client";
import ProductCard from "@/components/ProductCard";
import { ServiceCard } from "@/components/services/ServiceCard";
import {
  normalizeListing,
  toProductCardProps,
  toServiceCardProps,
  type NormalizedListing
} from "@/lib/normalizeListing";

type TopPayload = {
  products?: any[];
  services?: any[];
  items?: any[];
  top?: any[];
  data?: {
    products?: any[];
    services?: any[];
    items?: any[];
    top?: any[];
  };
};

type TopData = {
  products: NormalizedListing[];
  services: NormalizedListing[];
  source: string;
};

type TopEndpointAvailability = {
  homeTop: boolean | null;
  splitTop: boolean | null;
};

const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : []);
const TOP_MODE = (process.env.NEXT_PUBLIC_HOME_TOP_SOURCE || "trending").toLowerCase();
const TOP_AVAILABILITY_KEY = "home_top_endpoint_availability_v1";
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

let topAvailabilityCache: TopEndpointAvailability = {
  homeTop: null,
  splitTop: null
};

const readTopAvailability = (): TopEndpointAvailability => {
  if (typeof window === "undefined") return topAvailabilityCache;
  if (
    topAvailabilityCache.homeTop !== null ||
    topAvailabilityCache.splitTop !== null
  ) {
    return topAvailabilityCache;
  }

  try {
    const raw = window.localStorage.getItem(TOP_AVAILABILITY_KEY);
    if (!raw) return topAvailabilityCache;
    const parsed = JSON.parse(raw) as Partial<TopEndpointAvailability>;
    topAvailabilityCache = {
      homeTop:
        parsed.homeTop === true ? true : parsed.homeTop === false ? false : null,
      splitTop:
        parsed.splitTop === true ? true : parsed.splitTop === false ? false : null
    };
  } catch {
    topAvailabilityCache = { homeTop: null, splitTop: null };
  }

  return topAvailabilityCache;
};

const writeTopAvailability = (patch: Partial<TopEndpointAvailability>) => {
  topAvailabilityCache = {
    ...topAvailabilityCache,
    ...patch
  };
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      TOP_AVAILABILITY_KEY,
      JSON.stringify(topAvailabilityCache)
    );
  } catch {
    // ignore storage issues
  }
};

const resolveType = (item: any): "product" | "service" | "unknown" => {
  const type = String(item?.type ?? item?.kind ?? "").toLowerCase();
  if (type === "product") return "product";
  if (type === "service") return "service";
  return "unknown";
};

const splitTopPayload = (payload: TopPayload) => {
  const directProducts = asArray(payload?.products ?? payload?.data?.products);
  const directServices = asArray(payload?.services ?? payload?.data?.services);

  if (directProducts.length > 0 || directServices.length > 0) {
    return { products: directProducts, services: directServices };
  }

  const mixed = asArray(payload?.items ?? payload?.top ?? payload?.data?.items ?? payload?.data?.top);
  const products = mixed.filter((item) => resolveType(item) === "product");
  const services = mixed.filter((item) => resolveType(item) === "service");
  return { products, services };
};

const extractItems = (payload: any): any[] =>
  asArray(
    payload?.items ??
    payload?.products ??
    payload?.services ??
    payload?.data?.items ??
    payload?.data?.products ??
    payload?.data?.services ??
    payload
  );

const pickCanonicalId = (
  item: any,
  kind: "product" | "service",
  fallback: string
) => {
  const candidates =
    kind === "product"
      ? [
          item?.productId,
          item?.listingId,
          item?.targetId,
          item?.refId,
          item?._id,
          item?.id
        ]
      : [
          item?.serviceId,
          item?.listingId,
          item?.targetId,
          item?.refId,
          item?._id,
          item?.id
        ];

  const normalized = candidates
    .map((value) => (value === undefined || value === null ? "" : String(value).trim()))
    .filter(Boolean);

  const objectIdCandidate = normalized.find((value) => OBJECT_ID_RE.test(value));
  if (objectIdCandidate) return objectIdCandidate;
  return normalized[0] || fallback;
};

const normalizeTop = (items: any[], kind: "product" | "service"): NormalizedListing[] => {
  return items.map((item, idx) => {
    const normalized = normalizeListing(item, kind, idx);
    const id = pickCanonicalId(item, kind, normalized.id);
    return {
      ...normalized,
      id,
      _id: normalized._id ?? (item?._id ? String(item._id) : undefined),
      type: kind,
      href: kind === "product" ? `/products/${id}` : `/services/${id}`
    };
  });
};

const fetchHomeTop = async (): Promise<TopData> => {
  const res = await client.get<TopPayload>("/home/top", { params: { limit: 24 } });
  const { products, services } = splitTopPayload(res.data || {});
  return {
    products: normalizeTop(products, "product").slice(0, 3),
    services: normalizeTop(services, "service").slice(0, 3),
    source: "home/top"
  };
};

const fetchSplitTop = async (): Promise<TopData> => {
  const [productsRes, servicesRes] = await Promise.all([
    client.get("/products/top", { params: { limit: 3 } }),
    client.get("/services/top", { params: { limit: 3 } })
  ]);

  return {
    products: normalizeTop(extractItems(productsRes.data), "product").slice(0, 3),
    services: normalizeTop(extractItems(servicesRes.data), "service").slice(0, 3),
    source: "products/top+services/top"
  };
};

const fetchTrendingTop = async (): Promise<TopData> => {
  const [productsRes, servicesRes] = await Promise.all([
    client.get("/products/trending", { params: { limit: 3, page: 1 } }),
    client.get("/services/trending", { params: { limit: 3, page: 1 } })
  ]);

  return {
    products: normalizeTop(extractItems(productsRes.data), "product").slice(0, 3),
    services: normalizeTop(extractItems(servicesRes.data), "service").slice(0, 3),
    source: "products/trending+services/trending"
  };
};

const fetchTopWithFallback = async (): Promise<TopData> => {
  // Default: no probing endpoints that may not exist on local backend.
  // Set NEXT_PUBLIC_HOME_TOP_SOURCE=auto to enable probing /home/top and /products|services/top.
  if (TOP_MODE !== "auto") {
    return fetchTrendingTop();
  }

  const availability = readTopAvailability();

  if (availability.homeTop !== false) {
    try {
      const data = await fetchHomeTop();
      writeTopAvailability({ homeTop: true });
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 404) throw err;
      writeTopAvailability({ homeTop: false });
    }
  }

  if (availability.splitTop !== false) {
    try {
      const data = await fetchSplitTop();
      writeTopAvailability({ splitTop: true });
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status !== 404) throw err;
      writeTopAvailability({ splitTop: false });
    }
  }

  return fetchTrendingTop();
};

let topDataCache: TopData | null = null;
let topDataPromise: Promise<TopData> | null = null;

const loadTopDataOnce = async (): Promise<TopData> => {
  if (topDataCache) return topDataCache;
  if (!topDataPromise) {
    topDataPromise = fetchTopWithFallback()
      .then((data) => {
        topDataCache = data;
        return data;
      })
      .finally(() => {
        topDataPromise = null;
      });
  }
  return topDataPromise;
};

export function TopPodium() {
  const [topProducts, setTopProducts] = useState<NormalizedListing[]>([]);
  const [topServices, setTopServices] = useState<NormalizedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTop = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await loadTopDataOnce();

        if (process.env.NODE_ENV === "development") {
          console.log("TOP_SOURCE", data.source);
          console.log("TOP_PRODUCTS_COUNT", data.products.length);
          console.log("TOP_SERVICES_COUNT", data.services.length);
        }

        if (!active) return;
        setTopProducts(data.products);
        setTopServices(data.services);
      } catch (err: any) {
        if (process.env.NODE_ENV === "development") {
          console.log("TOP_SOURCE", "none");
          console.log("TOP_PRODUCTS_COUNT", 0);
          console.log("TOP_SERVICES_COUNT", 0);
        }
        if (!active) return;
        setTopProducts([]);
        setTopServices([]);
        setError(err?.message || "Top podiumni yuklab bo'lmadi");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTop();

    return () => {
      active = false;
    };
  }, []);

  const noopServiceAction = (_id: string, _next: boolean) => undefined;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/25">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Top podium</p>
          <h2 className="text-2xl font-bold text-slate-50">Haftalik top mahsulotlar va xizmatlar</h2>
          <p className="text-sm text-slate-400">Top endpoint ma'lumotlari asosida yangilanadi.</p>
        </div>
        {loading && <span className="text-xs text-slate-300">Yuklanmoqda...</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <span className="inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-500/40">
            Top Products
          </span>
          {loading ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`product-skeleton-${idx}`} className="h-40 animate-pulse rounded-2xl bg-slate-800/60" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
              Top mahsulotlar topilmadi.
            </div>
          ) : (
            <div className="grid gap-3">
              {topProducts.map((item) => (
                <ProductCard key={item.id ?? item._id} data={toProductCardProps(item)} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
          <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/40">
            Top Services
          </span>
          {loading ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`service-skeleton-${idx}`} className="h-40 animate-pulse rounded-2xl bg-slate-800/60" />
              ))}
            </div>
          ) : topServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
              Top xizmatlar topilmadi.
            </div>
          ) : (
            <div className="grid gap-3">
              {topServices.map((item) => (
                <ServiceCard
                  key={item.id ?? item._id}
                  service={toServiceCardProps(item)}
                  onLike={noopServiceAction}
                  onSave={noopServiceAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
