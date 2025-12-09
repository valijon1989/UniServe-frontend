import { api } from "./client";

export interface TrendService {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  hourlyRate?: number;
  currency?: string;
  location?: string;
  likes?: number;
  views?: number;
  orders?: number;
  createdBy?: {
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
}

interface TrendResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: T[];
}

const normalizeTrend = <T extends { _id?: string; id?: string }>(data: any): TrendResponse<T> => {
  const items = (data?.items as T[]) || [];
  return {
    page: Number(data?.page) || 1,
    limit: Number(data?.limit) || items.length || 9,
    total: Number(data?.total) || items.length,
    totalPages: Number(data?.totalPages) || 1,
    items: items.map((item, idx) => ({
      ...item,
      id: item.id || item._id || String(idx)
    }))
  };
};

export async function getTrendingServices(page = 1, limit = 9): Promise<TrendResponse<TrendService>> {
  const res = await api.get("/services/trending", { params: { page, limit } });
  return normalizeTrend<TrendService>(res.data);
}

export async function getLatestServices(): Promise<TrendService[]> {
  const res = await api.get("/services");
  const services: TrendService[] = res.data?.services || res.data?.items || res.data || [];
  return services
    .map((s, idx) => ({ ...s, id: s.id || s._id || String(idx) }))
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
}
