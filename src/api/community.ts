import { client } from "./client";
import type { CommunityGroup } from "@/data/communityGroups";
import type { ActivityType, CommunityPost } from "@/types/community";

const normalizeGroup = (raw: any): CommunityGroup => {
  const id = raw.id || raw._id || raw.slug || raw.groupId || raw.name;
  return {
    id: id ?? "unknown",
    title: raw.title || raw.name || raw.displayName || "Jamiyat",
    description: raw.description || raw.summary || raw.body || "",
    category: raw.category || raw.tags?.[0] || raw.topics?.[0] || "platform",
    tags: Array.isArray(raw.tags) ? raw.tags : raw.topics || [],
    members: Number(raw.members ?? raw.memberCount ?? raw.metrics?.members ?? 0),
    rating: Number(raw.rating ?? raw.stats?.rating ?? 0),
    spamReports: Number(raw.spamReports ?? raw.spamCount ?? 0),
    channelType: raw.channelType === "channel" || raw.type === "channel" ? "channel" : "group",
    privacy: raw.privacy === "closed" || raw.requiresApproval || raw.moderated ? "closed" : "open",
    host: raw.host || raw.owner || raw.adminName,
    requiresApproval: Boolean(raw.requiresApproval || raw.moderated),
    reviews: Number(raw.reviews ?? raw.reviewCount ?? raw.stats?.reviews ?? 0),
    isVerified: Boolean(raw.isVerified ?? raw.verified),
    lastActivity: raw.lastActivity || raw.updatedAt || raw.modifiedAt || new Date().toISOString()
  };
};

const normalizePosts = (raw: any, groupId: string): CommunityPost => {
  const attachments = (raw.attachments || raw.media || raw.files || []).map((attachment: any) => ({
    id: attachment.id || attachment.fileId || attachment.name || attachment.label,
    type:
      attachment.type === "video" || attachment.mime?.includes("video")
        ? "video"
        : attachment.type === "image" || attachment.mime?.includes("image")
        ? "image"
        : "document",
    label: attachment.label || attachment.name || attachment.fileName || "File"
  }));

  const activityType = (raw.type || raw.activityType || "post") as ActivityType;
  return {
    id: raw.id || raw._id || raw.slug || `${groupId}-${Math.random()}`,
    groupId,
    title: raw.title || raw.subject || raw.name || "Activity",
    body: raw.body || raw.content || raw.summary || "",
    type: activityType,
    category: raw.category || raw.topic || "Community",
    author: raw.author?.name || raw.authorName || raw.createdBy || "Foydalanuvchi",
    role: raw.author?.role || raw.role || "Member",
    createdAt: raw.createdAt || raw.publishedAt || raw.timestamp || new Date().toISOString(),
    likes: Number(raw.likes ?? raw.likeCount ?? raw.reactions ?? 0),
    replies: Number(raw.replies ?? raw.comments ?? 0),
    attachments: attachments.length ? attachments : undefined
  };
};

const asArray = (payload: any) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.groups)) return payload.groups;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export async function fetchCommunityGroups() {
  const response = await client.get("/community/groups");
  const payload = response.data;
  return asArray(payload).map(normalizeGroup);
}

export async function fetchCommunityGroup(groupId: string) {
  try {
    const response = await client.get(`/community/groups/${groupId}`);
    const payload = response.data;
    const group = (payload?.group || payload?.data || payload) as any;
    return normalizeGroup(group);
  } catch (error) {
    console.error("Failed to fetch community group", error);
    return null;
  }
}

export async function fetchCommunityPosts(groupId: string) {
  const response = await client.get(`/community/groups/${groupId}/posts`, {
    params: { limit: 6 }
  });
  const payload = response.data;
  const items = asArray(payload);
  return items.map((item) => normalizePosts(item, groupId));
}

export function joinCommunityGroup(groupId: string, action: "join" | "leave") {
  return client.post(`/community/groups/${groupId}/join`, { action });
}

export function rateCommunityGroup(groupId: string, rating: number) {
  return client.post(`/community/groups/${groupId}/rate`, { rating });
}

export function reportCommunityGroup(groupId: string, reason?: string) {
  return client.post(`/community/groups/${groupId}/report`, { reason });
}
