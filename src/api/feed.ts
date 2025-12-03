import { api } from "./client";

export interface FeedItem {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
    role: "USER" | "AGENT";
  };
  type: "PHOTO" | "VIDEO" | "ARTICLE";
  text: string;
  mediaUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export async function getFeed(): Promise<FeedItem[]> {
  const res = await api.get("/api/feed");
  return res.data.items || res.data;
}
