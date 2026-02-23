"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { client } from "@/api/client";
import { useI18n } from "@/context/i18n";

type Item = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  image?: string;
  banner?: string;
  thumbnail?: string;
  imageUrl?: string;
  coverUrl?: string;
  cover?: string;
  images?: Array<string | { src?: string; url?: string }>;
  media?: Array<string | { src?: string; url?: string }>;
  photos?: Array<string | { src?: string; url?: string }>;
  gallery?: Array<string | { src?: string; url?: string }>;
  description?: string;
  agent?: { name?: string };
  createdBy?: { name?: string };
  rating?: number;
  stats?: { likes?: number; views?: number; orders?: number };
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

const extractImage = (item: Item) => {
  const fromArray = (arr?: Array<string | { src?: string; url?: string }>) => {
    if (!arr || arr.length === 0) return undefined;
    const first = arr[0];
    if (typeof first === "string") return first;
    return first?.src || first?.url;
  };
  return (
    item.image ||
    item.banner ||
    item.thumbnail ||
    item.imageUrl ||
    item.coverUrl ||
    item.cover ||
    fromArray(item.images) ||
    fromArray(item.media) ||
    fromArray(item.photos) ||
    fromArray(item.gallery) ||
    "/placeholder.png"
  );
};

const extractRating = (item: Item) => {
  if (typeof item.rating === "number") return item.rating;
  const avg = (item as any)?.rating?.avg ?? (item as any)?.rating?.average;
  return typeof avg === "number" ? avg : 0;
};

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
  const { t } = useI18n();
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
        error:
          err?.message ||
          t({
            en: "Failed to load data",
            uz: "Ma'lumotlarni yuklab bo'lmadi",
            ru: "Не удалось загрузить данные",
            ko: "데이터를 불러오지 못했습니다"
          }),
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
        name:
          item.name ||
          item.title ||
          t({ en: "Untitled product", uz: "Nomsiz mahsulot", ru: "Без названия", ko: "이름 없는 상품" }),
        agent:
          item.agent?.name ||
          item.createdBy?.name ||
          t({ en: "Unknown agent", uz: "Agent ma'lum emas", ru: "Агент неизвестен", ko: "에이전트 정보 없음" }),
        image: extractImage(item),
        rating: extractRating(item),
        likes: item.likes ?? item.stats?.likes ?? 0,
        views: item.views ?? item.stats?.views ?? 0,
        orders: item.orders ?? item.stats?.orders ?? (item.stats as any)?.purchases ?? 0,
        href: item._id || item.id ? `/products/${item._id || item.id}` : "#"
      })),
    [products.items]
  );

  const serviceGrid = useMemo(
    () =>
      services.items.map((item) => ({
        key: item._id || item.id || item.name,
        name:
          item.name ||
          item.title ||
          t({ en: "Untitled service", uz: "Nomsiz xizmat", ru: "Без названия", ko: "이름 없는 서비스" }),
        agent:
          item.agent?.name ||
          item.createdBy?.name ||
          t({ en: "Unknown provider", uz: "Ijrochi ma'lum emas", ru: "Исполнитель неизвестен", ko: "제공자 정보 없음" }),
        image: extractImage(item),
        rating: extractRating(item),
        likes: item.likes ?? item.stats?.likes ?? 0,
        views: item.views ?? item.stats?.views ?? 0,
        orders: item.orders ?? item.stats?.orders ?? (item.stats as any)?.purchases ?? 0,
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
        <p className="text-sm text-slate-400">
          {t({ en: "Loading...", uz: "Yuklanmoqda...", ru: "Загрузка...", ko: "로딩 중..." })}
        </p>
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
            <span>{t({ en: "Likes", uz: "Layk", ru: "Лайки", ko: "좋아요" })} {item.likes}</span>
            <span>{t({ en: "Views", uz: "Ko'rishlar", ru: "Просмотры", ko: "조회" })} {item.views}</span>
            <span>{t({ en: "Orders", uz: "Buyurtmalar", ru: "Заказы", ko: "주문" })} {item.orders}</span>
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
          {t({ en: "Prev", uz: "Oldingi", ru: "Назад", ko: "이전" })}
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
          {t({ en: "Next", uz: "Keyingi", ru: "Далее", ko: "다음" })}
        </button>
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-black/30">
      <div className="mb-6 space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-sky-500/40">
          {t({ en: "Trend", uz: "Trend", ru: "Тренд", ko: "트렌드" })}
        </p>
        <h2 className="text-2xl font-bold text-slate-100">
          {t({
            en: "Trending products and services",
            uz: "Trenddagi mahsulot va xizmatlar",
            ru: "Трендовые товары и услуги",
            ko: "트렌딩 상품과 서비스"
          })}
        </h2>
        <p className="text-sm text-slate-400">
          {t({
            en: "Sorted by ratings, likes, orders, and views.",
            uz: "Reyting, layklar, xarid va ko'rishlar soniga ko'ra saralangan.",
            ru: "Отсортировано по рейтингу, лайкам, заказам и просмотрам.",
            ko: "평점, 좋아요, 주문, 조회 수를 기준으로 정렬됩니다."
          })}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              {t({ en: "Trending Products", uz: "Trend mahsulotlar", ru: "Трендовые товары", ko: "트렌딩 상품" })}
            </h3>
            {renderPagination(products.totalPages, products.page, (val) => void loadItems("products", val))}
          </div>
          {renderGrid(
            productGrid,
            products.loading,
            products.error,
            t({ en: "No products found.", uz: "Mahsulotlar topilmadi.", ru: "Товары не найдены.", ko: "상품이 없습니다." })
          )}
        </div>

        <div className="border-t border-slate-800 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              {t({ en: "Trending Services", uz: "Trend xizmatlar", ru: "Трендовые услуги", ko: "트렌딩 서비스" })}
            </h3>
            {renderPagination(services.totalPages, services.page, (val) => void loadItems("services", val))}
          </div>
          {renderGrid(
            serviceGrid,
            services.loading,
            services.error,
            t({ en: "No services found.", uz: "Xizmatlar topilmadi.", ru: "Услуги не найдены.", ko: "서비스가 없습니다." })
          )}
        </div>
      </div>
    </section>
  );
}
