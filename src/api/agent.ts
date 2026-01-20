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

export type AgentListParams = {
  active?: boolean;
  sort?: "recent" | "oldest" | "likes" | "views" | "rating";
  page?: number;
  limit?: number;
  search?: string;
};

export interface AgentListItem {
  _id?: string;
  id?: string;
  name?: string;
  nickname?: string;
  username?: string;
  avatarUrl?: string;
  rating?: number;
  views?: number;
  likes?: number;
  active?: boolean;
  verifiedByAdmin?: boolean;
  isVerified?: boolean;
  user?: {
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
  };
}

export interface AgentListingCard {
  id: string;
  type: "product" | "service" | "education" | "construction" | "taxi";
  title?: string;
  imageUrl?: string;
}

export interface AgentDetail {
  _id?: string;
  id?: string;
  name?: string;
  nickname?: string;
  username?: string;
  avatarUrl?: string;
  rating?: number;
  views?: number;
  likes?: number;
  region?: string;
  regionDetail?: string;
  bio?: string;
  listings?: {
    listingCards?: AgentListingCard[];
  };
}

export interface AgentReview {
  _id?: string;
  id?: string;
  user?: {
    name?: string;
    username?: string;
    avatarUrl?: string;
  };
  rating: number;
  comment: string;
  createdAt?: string;
}

export async function getAgents(params: AgentListParams) {
  const res = await api.get("/agents", { params });
  const payload = res.data || {};
  const items: AgentListItem[] =
    payload.items ||
    payload.agents?.items ||
    payload.agents?.data ||
    payload.agents ||
    payload.data?.items ||
    payload.data?.agents ||
    payload.data ||
    payload.results ||
    [];
  return {
    items,
    total:
      payload.total ??
      payload.count ??
      payload.agents?.total ??
      payload.data?.total ??
      payload.results?.total ??
      items.length
  };
}

export async function getAgentById(agentId: string): Promise<AgentDetail | null> {
  const res = await api.get(`/agents/${agentId}`);
  return res.data?.agent || res.data || null;
}

export async function getAgentReviews(agentId: string): Promise<AgentReview[]> {
  const res = await api.get(`/agents/${agentId}/reviews`);
  return res.data?.items || res.data?.reviews || res.data || [];
}

export async function createAgentReview(
  agentId: string,
  payload: { rating: number; comment: string }
): Promise<AgentReview> {
  const res = await api.post(`/agents/${agentId}/reviews`, payload);
  return res.data;
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
