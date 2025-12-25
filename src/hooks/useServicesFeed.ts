"use client";

import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import type { ServiceListItem } from "@/lib/servicesTypes";
import { fetcher, toQuery } from "@/lib/fetcher";

type ServicesResponse = {
  items?: any[];
  services?: any[];
  nextCursor?: string | null;
  hasMore?: boolean;
};

type QueryParams = {
  tab?: string;
  category?: string;
  subCategory?: string;
  q?: string;
  sort?: string;
  providerType?: string;
  deliveryMode?: string;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
};

const formatPrice = (value?: number, currency = "₩", priceType = "fixed") => {
  if (!value) return "-";
  if (priceType === "hourly") {
    return `${currency}${value.toLocaleString("en-US")} / hour`;
  }
  return `${currency}${value.toLocaleString("en-US")}`;
};

const getCoverType = (url?: string) => {
  if (!url) return "image" as const;
  return url.endsWith(".mp4") ? "video" : "image";
};

const normalizeService = (item: any): ServiceListItem => {
  const id = item.id || item._id || item.slug || String(item.title || "service");
  const price = item.price ?? item.cost ?? 0;
  const priceType = item.priceType || item.billing || "fixed";
  const currency = item.currency || "₩";
  const coverUrl =
    item.coverUrl ||
    item.cover ||
    item.thumbnail ||
    item.image ||
    item.media?.[0]?.url ||
    item.images?.[0];
  return {
    id,
    title: item.title || item.name || "Service",
    description: item.description || item.summary || "",
    coverUrl,
    coverType: getCoverType(coverUrl),
    priceLabel: formatPrice(price, currency, priceType),
    tags: item.tags || item.labels || [],
    certificates: item.certificates || item.certs || [],
    provider: {
      id: item.provider?.id || item.agent?.id || item.providerId || "provider",
      name: item.provider?.name || item.agent?.name || item.providerName || "Provider",
      avatarUrl: item.provider?.avatar || item.agent?.avatar || item.providerAvatar,
      verified: item.provider?.verified ?? item.agent?.verified ?? item.verified ?? false
    },
    stats: {
      views: item.views ?? item.stats?.views ?? 0,
      likes: item.likes ?? item.stats?.likes ?? 0,
      saves: item.saves ?? item.stats?.saves ?? 0,
      rating: item.rating ?? item.stats?.rating ?? 0,
      ratingCount: item.ratingCount ?? item.stats?.ratingCount ?? 0
    },
    liked: Boolean(item.liked),
    saved: Boolean(item.saved),
    createdAt: item.createdAt || item.created_at,
    category: item.category,
    subCategory: item.subCategory || item.sub
  };
};

export function useServicesFeed(params: QueryParams) {
  const getKey = (pageIndex: number, previousPageData: ServicesResponse | null) => {
    if (previousPageData && !previousPageData.hasMore && !previousPageData.nextCursor) return null;
    const cursor = pageIndex === 0 ? null : previousPageData?.nextCursor;
    const query = toQuery({
      ...params,
      cursor,
      limit: params.limit ?? 12
    });
    return `/api/services?${query}`;
  };

  const swr = useSWRInfinite<ServicesResponse>(getKey, fetcher, {
    revalidateOnFocus: false
  });

  const items = useMemo(() => {
    if (!swr.data) return [];
    const flat = swr.data.flatMap((page) => page.items || page.services || []);
    return flat.map(normalizeService);
  }, [swr.data]);

  const lastPage = swr.data?.[swr.data.length - 1];
  const hasMore = Boolean(lastPage?.hasMore ?? lastPage?.nextCursor);

  return {
    ...swr,
    items,
    hasMore
  };
}
