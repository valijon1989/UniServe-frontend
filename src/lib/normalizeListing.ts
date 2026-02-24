import type { Product } from "@/api/products";
import type { ServiceListItem } from "@/lib/servicesTypes";

export type ListingKind = "product" | "service";
export type ListingType = ListingKind | "unknown";

export type NormalizedListing = {
  id: string;
  _id?: string;
  kind: ListingKind;
  type: ListingType;
  title: string;
  createdAt?: string;
  price: number;
  salePrice: number;
  discountPercent: number;
  isOnSale: boolean;
  isSale?: boolean;
  image?: string;
  stats: {
    likes: number;
    views: number;
    orders: number;
  };
  href: string;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    const parsed = toNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
};

const pickString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const round2 = (value: number) => Number(value.toFixed(2));

export const extractListingItems = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  const nested = payload.data;
  const items =
    payload.items ||
    payload.products ||
    payload.services ||
    nested?.items ||
    nested?.products ||
    nested?.services ||
    nested;

  return Array.isArray(items) ? items : [];
};

export const normalizeListing = (
  item: any,
  kind: ListingKind,
  idx = 0
): NormalizedListing => {
  const rawId =
    kind === "service"
      ? item?._id ?? item?.id ?? item?.slug ?? `${kind}-${idx}`
      : item?._id ?? item?.id ?? `${kind}-${idx}`;
  const id = String(rawId);

  const directPrice = pickNumber(
    item?.price,
    item?.cost,
    item?.amount,
    item?.hourlyRate,
    item?.rate,
    item?.fee
  );
  const explicitSalePrice = pickNumber(
    item?.salePrice,
    item?.discountPrice,
    item?.finalPrice,
    item?.currentPrice,
    item?.dealPrice,
    item?.priceAfterDiscount
  );
  let price = pickNumber(
    item?.oldPrice,
    item?.old_price,
    item?.originalPrice,
    item?.basePrice,
    item?.listPrice,
    item?.priceBeforeDiscount,
    item?.preDiscountPrice,
    item?.priceOld
  );
  let salePrice = explicitSalePrice ?? directPrice;
  let discountPercent = pickNumber(
    item?.discountPercent,
    item?.discount,
    item?.off,
    item?.percentOff,
    item?.discount_rate,
    item?.salePercent
  );

  if (salePrice === null && price !== null) salePrice = price;

  if (
    price === null &&
    salePrice !== null &&
    discountPercent !== null &&
    discountPercent > 0 &&
    discountPercent < 100
  ) {
    price = (salePrice * 100) / (100 - discountPercent);
  }

  if (price === null) price = salePrice ?? 0;
  if (salePrice === null) salePrice = price;

  if (salePrice > price) {
    const swap = price;
    price = salePrice;
    salePrice = swap;
  }

  if (!(discountPercent !== null && discountPercent > 0 && discountPercent < 100)) {
    if (price > 0 && salePrice < price) {
      discountPercent = ((price - salePrice) / price) * 100;
    } else {
      discountPercent = 0;
    }
  }

  const safePrice = round2(Math.max(0, price));
  const safeSalePrice = round2(Math.max(0, salePrice));
  const safeDiscount = Math.max(0, Math.min(99, Math.round(discountPercent)));
  const rawIsSale = toBoolean(item?.isSale);
  const rawIsOnSale = [
    item?.isOnSale,
    item?.isSale,
    item?.onSale,
    item?.isDiscounted,
    item?.discounted,
    item?.saleActive
  ].some(toBoolean);
  const normalizedIsOnSale =
    rawIsOnSale ||
    (safeSalePrice > 0 && safePrice > 0 && safeSalePrice < safePrice) ||
    safeDiscount > 0;

  const image =
    pickString(
      item?.coverImage,
      item?.image,
      item?.imageUrl,
      item?.images?.[0],
      item?.coverImageUrl,
      item?.thumbnail,
      item?.media?.[0]
    ) ?? undefined;

  return {
    id,
    _id: pickString(item?._id, item?.id) ?? undefined,
    kind,
    type: kind,
    title:
      pickString(item?.title, item?.name, item?.label) ||
      (kind === "product" ? "Mahsulot" : "Xizmat"),
    createdAt: pickString(item?.createdAt, item?.created_at, item?.updatedAt, item?.updated_at) ?? undefined,
    price: safePrice,
    salePrice: safeSalePrice,
    discountPercent: safeDiscount,
    isOnSale: normalizedIsOnSale,
    isSale: rawIsSale,
    image,
    stats: {
      likes: pickNumber(item?.stats?.likes, item?.likes, item?.likeCount) ?? 0,
      views: pickNumber(item?.stats?.views, item?.views, item?.viewCount) ?? 0,
      orders:
        pickNumber(
          item?.stats?.orders,
          item?.orders,
          item?.stats?.purchases,
          item?.purchases,
          item?.orderCount
        ) ?? 0
    },
    href: kind === "product" ? `/products/${id}` : `/services/${id}`
  };
};

const formatServicePrice = (value: number) => {
  if (!value || value <= 0) return "-";
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};

export const toProductCardProps = (listing: NormalizedListing): Product => {
  const hasDiscount = listing.discountPercent > 0 && listing.price > listing.salePrice;
  const images = listing.image ? [listing.image] : [];
  return {
    _id: listing.id,
    id: listing.id,
    title: listing.title,
    name: listing.title,
    price: listing.salePrice,
    oldPrice: hasDiscount ? listing.price : undefined,
    thumbnail: listing.image ?? "/placeholder.png",
    images,
    stats: {
      views: listing.stats.views,
      likes: listing.stats.likes,
      purchases: listing.stats.orders
    },
    views: listing.stats.views,
    likes: listing.stats.likes,
    orders: listing.stats.orders,
    rating: { avg: 0, count: 0 }
  };
};

export const toServiceCardProps = (listing: NormalizedListing): ServiceListItem => {
  const image = listing.image;
  return {
    id: listing.id,
    title: listing.title,
    description: "",
    coverUrl: image,
    coverType: image?.toLowerCase().endsWith(".mp4") ? "video" : "image",
    priceLabel: formatServicePrice(listing.salePrice),
    tags: [],
    certificates: [],
    provider: {
      id: `provider-${listing.id}`,
      name: "Provider",
      avatarUrl: "/placeholder.png",
      verified: false
    },
    stats: {
      views: listing.stats.views,
      likes: listing.stats.likes,
      saves: listing.stats.orders,
      rating: 0,
      ratingCount: 0
    },
    liked: false,
    saved: false,
    category: "consulting"
  };
};
