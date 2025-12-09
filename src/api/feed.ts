import { api } from "./client";

export interface FeedItem {
  id?: string;
  _id?: string;
  author: {
    _id?: string;
    name?: string;
    avatarUrl?: string;
    role?: "USER" | "AGENT" | "ADMIN" | string;
  };
  type?: string;
  category?: string;
  text?: string;
  content?: string;
  images?: string[];
  mediaUrl?: string;
  createdAt: string;
  likesCount?: number;
  likes?: any[];
  commentsCount?: number;
  comments?: any[];
}

export async function getFeed(): Promise<FeedItem[]> {
  const res = await api.get("/feed");
  const normalize = (value: any): FeedItem[] | null => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const values = Object.values(value);
      return Array.isArray(values) ? values as FeedItem[] : null;
    }
    return null;
  };

  const candidates = [
    res.data?.items,
    res.data?.data?.items,
    res.data?.data,
    res.data
  ];

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    if (normalized) {
      return normalized.map((item, idx) => {
        const author = item.author || {};
        const images = item.images || [];
        return {
          ...item,
          id: item.id || item._id || String(idx),
          text: item.text ?? item.content ?? "",
          content: item.content ?? item.text ?? "",
          mediaUrl: item.mediaUrl || images[0],
          createdAt: item.createdAt || new Date().toISOString(),
          likesCount: item.likesCount ?? (Array.isArray(item.likes) ? item.likes.length : 0),
          commentsCount: item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0),
          author: {
            _id: author._id,
            name: author.name || "Foydalanuvchi",
            avatarUrl: author.avatarUrl,
            role: (author.role as any) || "USER"
          },
          type: item.type || item.category || ""
        };
      });
    }
  }

  console.warn("Unexpected feed response shape", res.data);
  return [];
}
