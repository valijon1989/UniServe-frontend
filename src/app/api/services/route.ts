import { NextRequest, NextResponse } from "next/server";
import { servicesMock } from "@/data/servicesMock";

type QueryParams = {
  tab?: string;
  category?: string;
  q?: string;
  sort?: string;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
  cursor?: number;
};

const parseNumber = (value: string | null, fallback = 0) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTab = (tab?: string) => {
  if (!tab) return undefined;
  if (tab === "social") return "spiritual";
  if (tab === "material" || tab === "spiritual") return tab;
  return tab;
};

const applyFilters = (services: typeof servicesMock, params: QueryParams) => {
  return services.filter((service) => {
    if (params.category && service.category !== params.category) return false;
    if (params.tab && normalizeTab(params.tab) && service.groupId !== normalizeTab(params.tab)) return false;
    if (params.minRating && service.stats.rating < params.minRating) return false;
    if (params.priceMin && service.price < params.priceMin) return false;
    if (params.priceMax && service.price > params.priceMax) return false;
    if (params.q) {
      const query = params.q.toLowerCase();
      if (
        !service.title.toLowerCase().includes(query) &&
        !service.provider.name.toLowerCase().includes(query) &&
        !service.description.toLowerCase().includes(query) &&
        !service.tags.some((tag) => tag.toLowerCase().includes(query))
      ) {
        return false;
      }
    }
    return true;
  });
};

const applySort = (services: typeof servicesMock, sort?: string) => {
  const sorted = [...services];
  if (sort === "rating") {
    return sorted.sort((a, b) => b.stats.rating - a.stats.rating);
  }
  if (sort === "newest") {
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  if (sort === "oldest") {
    return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return sorted.sort((a, b) => b.stats.views - a.stats.views);
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tab = params.get("tab") || undefined;
  const category = params.get("category") || undefined;
  const q = params.get("q") || undefined;
  const sort = params.get("sort") || "popular";
  const cursor = parseNumber(params.get("cursor"), 0);
  const limit = Math.max(1, Math.min(48, parseNumber(params.get("limit"), 12)));
  const minRating = parseNumber(params.get("minRating"), 0);
  const priceMin = parseNumber(params.get("minPrice"), 0);
  const priceMax = parseNumber(params.get("maxPrice"), Infinity);

  const filtered = applyFilters(servicesMock, {
    tab,
    category,
    q,
    sort,
    minRating,
    priceMin: priceMin || undefined,
    priceMax: priceMax !== Infinity ? priceMax : undefined
  });

  const sorted = applySort(filtered, sort);
  const sliced = sorted.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < sorted.length ? cursor + limit : null;

  return NextResponse.json({
    items: sliced,
    hasMore: nextCursor !== null,
    nextCursor,
    total: sorted.length
  });
}
