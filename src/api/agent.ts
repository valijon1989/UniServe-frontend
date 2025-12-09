import { api } from "./client";

export interface Listing {
  _id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl?: string;
  status?: "ACTIVE" | "SOLD" | "ARCHIVED";
}

export interface TopAgent {
  _id?: string;
  id?: string;
  name?: string;
  rating?: number;
  score?: number;
  posts?: number;
  verifiedByAdmin?: boolean;
  faceIdVerified?: boolean;
  kind?: "SELLER" | "SERVICE";
  serviceCategory?: string;
  snippet?: string;
  user?: {
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    region?: string;
    postsCount?: number;
  };
}

export async function getMyListings(): Promise<Listing[]> {
  const res = await api.get("/agent/listings");
  return res.data.items || res.data;
}

export async function createListing(input: Listing): Promise<Listing> {
  const res = await api.post("/agent/listings", input);
  return res.data;
}

export async function updateListing(id: string, input: Partial<Listing>): Promise<Listing> {
  const res = await api.put(`/agent/listings/${id}`, input);
  return res.data;
}

export async function deleteListing(id: string): Promise<void> {
  await api.delete(`/agent/listings/${id}`);
}

export async function getTopAgents(limit = 20): Promise<TopAgent[]> {
  const res = await api.get("/agents/top", { params: { limit } });
  const agents: TopAgent[] = res.data?.agents || res.data?.items || res.data || [];
  return agents.map((a, idx) => ({
    ...a,
    id: a.id || a._id || String(idx)
  }));
}
