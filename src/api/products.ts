import { api } from "./client";

export interface ProductRating {
  avg: number;
  count: number;
}

export interface ProductStats {
  views: number;
  likes: number;
  purchases: number;
}

export interface ProductVendor {
  name?: string;
  username?: string;
  avatarUrl?: string;
  rating?: number;
  location?: string;
  contact?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  oldPrice?: number;
  currency?: string;
  thumbnail?: string;
  images?: string[];
  likes?: number;
  views?: number;
  orders?: number;
  category?: string;
  createdAt?: string;
  createdBy?: {
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
  };
  rating?: ProductRating;
  stats?: ProductStats;
  specifications?: Record<string, string>;
  vendor?: ProductVendor;
  brand?: string;
  condition?: string;
  size?: string;
  season?: string;
  audience?: string;
}

export interface ProductsResponse {
  page: number;
  limit: number;
  total: number;
  products: Product[];
}

export type TrendProduct = Product;

export interface TrendResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
}

const extractItems = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return (
    data.products
    || data.items
    || data.data?.items
    || data.data
    || []
  );
};

const normalizeProduct = (product: any, idx = 0): Product => {
  const id = product?.id || product?._id || String(idx);
  const title = product?.title || product?.name || "Product";
  const images = product?.images?.length ? product.images : product?.media || [];
  const primaryImage = product?.thumbnail || product?.imageUrl || images[0];

  const rating: ProductRating = {
    avg: Number(product?.rating?.avg ?? product?.rating?.average ?? product?.rating ?? 0),
    count: Number(product?.rating?.count ?? product?.ratingCount ?? 0)
  };

  const stats: ProductStats = {
    views: Number(product?.stats?.views ?? product?.views ?? 0),
    likes: Number(product?.stats?.likes ?? product?.likes ?? 0),
    purchases: Number(product?.stats?.purchases ?? product?.orders ?? product?.purchases ?? 0)
  };

  return {
    ...product,
    id,
    _id: product?._id ?? id,
    title,
    name: product?.name || title,
    thumbnail: primaryImage,
    images: images.length ? images : primaryImage ? [primaryImage] : [],
    rating,
    stats
  };
};

// Bazani ikki marta takrorlamaslik uchun dinamik endpoint prefiksi
const PRODUCTS_PATH = process.env.NEXT_PUBLIC_API_URL?.includes("/api")
  ? "/products"
  : "/api/products";

export async function getProducts(params: Record<string, any> = {}): Promise<ProductsResponse> {
  const res = await api.get(PRODUCTS_PATH, { params });
  const items = extractItems(res.data);

  const page = Number(res.data?.page ?? params.page ?? 1) || 1;
  const limit = Number(res.data?.limit ?? params.limit ?? 12) || 12;
  const total = Number(res.data?.total ?? res.data?.count ?? items.length) || items.length;

  return {
    page,
    limit,
    total,
    products: items.map(normalizeProduct)
  };
}

export async function getProductDetail(id: string): Promise<Product> {
  const res = await api.get(`${PRODUCTS_PATH}/${id}`);
  return normalizeProduct(res.data, 0);
}

// Alias user so‘ragani uchun
export const getProductById = getProductDetail;

export async function addProductView(id: string) {
  return api.post(`${PRODUCTS_PATH}/${id}/view`);
}

export async function likeProduct(id: string) {
  return api.post(`${PRODUCTS_PATH}/${id}/like`);
}

export async function purchaseProduct(id: string) {
  return api.post(`${PRODUCTS_PATH}/${id}/purchase`);
}

const normalizeTrend = (data: any): TrendResponse<Product> => {
  const items = extractItems(data);
  const limit = Number(data?.limit) || items.length || 9;
  const total = Number(data?.total) || items.length;
  return {
    page: Number(data?.page) || 1,
    limit,
    total,
    totalPages: Number(data?.totalPages) || Math.max(1, Math.ceil(total / Math.max(1, limit))),
    items: items.map(normalizeProduct)
  };
};

export async function getTrendingProducts(page = 1, limit = 9): Promise<TrendResponse<TrendProduct>> {
  const res = await api.get(`${PRODUCTS_PATH}/trending`, { params: { page, limit } });
  return normalizeTrend(res.data);
}

export async function getLatestProducts(): Promise<TrendProduct[]> {
  const res = await api.get(PRODUCTS_PATH, { params: { order: "latest", limit: 20 } });
  const products = extractItems(res.data).map(normalizeProduct);
  return products.sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });
}
