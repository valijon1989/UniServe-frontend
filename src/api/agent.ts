import { api } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const normalizeMediaUrl = (value?: string) => {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/api/")) return `${API_ORIGIN}${trimmed}`;
  return trimmed;
};

const normalizeUserAvatar = <T extends { avatarUrl?: string } | undefined>(user: T): T => {
  if (!user) return user;
  return {
    ...user,
    avatarUrl: normalizeMediaUrl(user.avatarUrl)
  };
};

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
  avatarUrl?: string;
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
  verified?: 1 | 0;
  withListings?: 1 | 0;
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
  listingsCount?: number;
  productsCount?: number;
  servicesCount?: number;
  kind?: "SELLER" | "SERVICE";
  completedJobs?: number;
  jobsDone?: number;
  responseTime?: number;
  responseMinutes?: number;
  complaintRate?: number;
  cancelRate?: number;
  region?: string;
  user?: {
    _id?: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
    isVerified?: boolean;
    bio?: string;
    region?: string;
    postsCount?: number;
    updatedAt?: string;
    createdAt?: string;
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
  verifiedByAdmin?: boolean;
  isVerified?: boolean;
  listingsCount?: number;
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
  const rawItems: AgentListItem[] =
    payload.items ||
    payload.agents?.items ||
    payload.agents?.data ||
    payload.agents ||
    payload.data?.items ||
    payload.data?.agents ||
    payload.data ||
    payload.results ||
    [];
  const items: AgentListItem[] = rawItems.map((item) => ({
    ...item,
    avatarUrl: normalizeMediaUrl(item.avatarUrl),
    user: normalizeUserAvatar(item.user)
  }));
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
  const payload = res.data || null;
  if (!payload) return null;
  const rawAgent = payload.agent || payload;
  const user = rawAgent?.user || rawAgent?.userProfile || rawAgent?.account || rawAgent?.owner;
  const profile = rawAgent?.profile || rawAgent?.agentProfile || rawAgent?.details;
  const base = user || rawAgent || {};
  const profileData = profile || rawAgent || {};
  const listings = payload.listings || rawAgent?.listings || {};
  const listingCards = (listings.listingCards || []).map((card: any) => ({
    ...card,
    id: String(card.id || card._id || ""),
    imageUrl: card.imageUrl || card.image || card.images?.[0]
  }));
  const listingsCount =
    typeof listings.listingsCount === "number"
      ? listings.listingsCount
      : listingCards.length ||
        (listings.products?.length || 0) +
          (listings.services?.length || 0) +
          (listings.educationListings?.length || 0) +
          (listings.constructionListings?.length || 0) +
          (listings.taxiListings?.length || 0);

  return {
    id: base._id || rawAgent?._id,
    _id: base._id || rawAgent?._id,
    name: base.name || rawAgent?.name,
    nickname: rawAgent?.nickname,
    username: base.username || rawAgent?.username,
    avatarUrl: normalizeMediaUrl(base.avatarUrl || rawAgent?.avatarUrl),
    rating: profileData.rating ?? rawAgent?.rating,
    views: profileData.profileViews ?? rawAgent?.views,
    likes: profileData.profileLikes ?? rawAgent?.likes,
    region: base.region || rawAgent?.region,
    regionDetail: rawAgent?.regionDetail,
    bio: base.bio || rawAgent?.bio,
    verifiedByAdmin: profileData.verifiedByAdmin ?? rawAgent?.verifiedByAdmin,
    isVerified: base.isVerified ?? rawAgent?.isVerified,
    listingsCount,
    listings: {
      ...listings,
      listingCards
    }
  };
}

export async function getAgentReviews(agentId: string): Promise<AgentReview[]> {
  const res = await api.get(`/agents/${agentId}/reviews`);
  const raw: AgentReview[] = res.data?.items || res.data?.reviews || res.data || [];
  return raw.map((review) => ({
    ...review,
    user: normalizeUserAvatar(review.user)
  }));
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
    id: a.id || a._id || String(idx),
    avatarUrl: normalizeMediaUrl(a.avatarUrl),
    user: normalizeUserAvatar(a.user)
  }));
}
