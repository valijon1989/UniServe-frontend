import { AxiosError } from "axios";
import { api } from "./client";

export interface FeedAuthor {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  role?: "USER" | "AGENT" | "ADMIN" | string;
}

export interface FeedComment {
  id?: string;
  _id?: string;
  text: string;
  content?: string;
  createdAt: string;
  author?: FeedAuthor;
}

export interface FeedItem {
  id?: string;
  _id?: string;
  slug?: string;
  author: FeedAuthor;
  type?: string;
  category?: string;
  text?: string;
  content?: string;
  linkUrl?: string;
  links?: string[];
  images?: string[];
  mediaUrl?: string;
  createdAt: string;
  likesCount?: number;
  dislikesCount?: number;
  sharesCount?: number;
  commentsCount?: number;
  likes?: unknown[];
  dislikes?: unknown[];
  comments?: unknown[];
  shares?: unknown[];
}

export interface CreateFeedInput {
  text?: string;
  content?: string;
  category?: string;
  type?: string;
  linkUrl?: string;
  links?: string[];
  images?: string[];
  mediaUrl?: string;
  files?: File[];
}

export interface FeedListOptions {
  sort?: "oldest_first" | "newest_first";
}

const FEED_LIST_PATHS = ["/posts", "/feed"];

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  return [];
};

const toCount = (value: unknown, fallback = 0) => {
  if (Array.isArray(value)) return value.length;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : fallback;
};

const toDate = (value: unknown): string => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
};

const isNotFound = (error: unknown) => {
  return error instanceof AxiosError && Boolean(error.response?.status && [404, 405].includes(error.response.status));
};

const isRetryablePostCreateError = (error: unknown) => {
  if (isNotFound(error)) return true;
  if (!(error instanceof AxiosError)) return false;
  const status = error.response?.status;
  if (!status) return false;
  return [400, 409, 413, 415, 422, 500].includes(status);
};

const normalizeAuthor = (value: unknown): FeedAuthor => {
  const raw = asRecord(value) || {};
  return {
    _id: raw._id || raw.id || raw.userId,
    id: raw.id || raw._id || raw.userId,
    name: raw.name || raw.fullName || raw.username || "Foydalanuvchi",
    username: raw.username || raw.nick,
    avatarUrl: raw.avatarUrl || raw.avatar || raw.image,
    role: raw.role || "USER"
  };
};

const normalizeComment = (value: unknown, idx = 0): FeedComment => {
  const raw = asRecord(value) || {};
  const text = String(raw.text || raw.content || raw.body || raw.message || "").trim();
  return {
    id: String(raw.id || raw._id || `comment-${idx}`),
    _id: raw._id || raw.id,
    text,
    content: String(raw.content || raw.text || "").trim() || text,
    createdAt: toDate(raw.createdAt || raw.updatedAt || raw.date),
    author: normalizeAuthor(raw.author || raw.user)
  };
};

const pickMediaFromRaw = (raw: Record<string, any>, normalizedImages: string[]) => {
  return (
    raw.mediaUrl ||
    raw.videoUrl ||
    raw.imageUrl ||
    raw.image ||
    raw.thumbnail ||
    normalizedImages[0] ||
    undefined
  );
};

const normalizeFeedItem = (value: unknown, idx = 0): FeedItem => {
  const raw = asRecord(value) || {};
  const images = asArray(raw.images || raw.media || raw.files || raw.attachments)
    .map((item) => {
      if (typeof item === "string") return item;
      const asObj = asRecord(item);
      return asObj?.url || asObj?.path || asObj?.location || asObj?.src || "";
    })
    .filter((item): item is string => Boolean(item));

  const normalizedComments = asArray(raw.comments).map((item, commentIdx) => normalizeComment(item, commentIdx));
  const likesCount = toCount(raw.likesCount ?? raw.likeCount ?? raw.likes, 0);
  const dislikesCount = toCount(raw.dislikesCount ?? raw.dislikeCount ?? raw.dislikes, 0);
  const sharesCount = toCount(raw.sharesCount ?? raw.shareCount ?? raw.shares, 0);
  const commentsCount = toCount(raw.commentsCount ?? raw.commentCount ?? raw.comments, normalizedComments.length);

  return {
    ...raw,
    id: String(raw.id || raw._id || raw.slug || `post-${idx}`),
    _id: raw._id || raw.id,
    slug: raw.slug,
    author: normalizeAuthor(raw.author || raw.user || raw.owner),
    type: raw.type || raw.category || "social",
    category: raw.category || raw.type || "social",
    text: String(raw.text || raw.content || "").trim(),
    content: String(raw.content || raw.text || "").trim(),
    linkUrl: raw.linkUrl || raw.url,
    links: asArray(raw.links)
      .map((item) => String(item || "").trim())
      .filter(Boolean),
    images,
    mediaUrl: pickMediaFromRaw(raw, images),
    createdAt: toDate(raw.createdAt || raw.publishedAt || raw.updatedAt),
    likesCount,
    dislikesCount,
    sharesCount,
    commentsCount,
    likes: asArray(raw.likes),
    dislikes: asArray(raw.dislikes),
    comments: normalizedComments,
    shares: asArray(raw.shares)
  };
};

const extractFeedItems = (raw: unknown): unknown[] => {
  const asItems = (value: unknown): unknown[] | null => {
    if (Array.isArray(value)) return value;
    const obj = asRecord(value);
    if (!obj) return null;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.posts)) return obj.posts;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.data)) return obj.data;
    return null;
  };

  const root = asRecord(raw);
  const candidates: unknown[] = [
    raw,
    root?.items,
    root?.posts,
    root?.data,
    root?.data?.items,
    root?.data?.posts,
    root?.payload,
    root?.payload?.items,
    root?.result,
    root?.result?.items
  ];

  for (const candidate of candidates) {
    const list = asItems(candidate);
    if (list) return list;
  }

  return [];
};

const extractSinglePost = (raw: unknown): FeedItem | null => {
  const root = asRecord(raw);
  const candidates: unknown[] = [
    raw,
    root?.item,
    root?.post,
    root?.data,
    root?.data?.item,
    root?.data?.post,
    root?.payload,
    root?.payload?.item,
    root?.result,
    root?.result?.item
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      if (candidate.length > 0) return normalizeFeedItem(candidate[0], 0);
      continue;
    }
    const record = asRecord(candidate);
    if (!record) continue;
    if (typeof record.id === "string" || typeof record._id === "string" || typeof record.slug === "string") {
      return normalizeFeedItem(record, 0);
    }
    if (record.author || record.user || record.content || record.text) {
      return normalizeFeedItem(record, 0);
    }
  }

  return null;
};

async function getByPaths(paths: string[], params?: Record<string, unknown>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.get(path, params ? { params } : undefined);
    } catch (error) {
      if (isNotFound(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("Feed endpoint topilmadi");
}

function buildPostFormData(payload: CreateFeedInput) {
  const formData = new FormData();
  const text = (payload.text || payload.content || "").trim();

  if (text) {
    formData.append("text", text);
    formData.append("content", text);
  }

  const linkUrl = (payload.linkUrl || "").trim();
  if (linkUrl) formData.append("linkUrl", linkUrl);

  const links = (payload.links || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  links.forEach((item) => formData.append("links", item));

  const images = (payload.images || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  images.forEach((item) => formData.append("images", item));

  const mediaUrl = (payload.mediaUrl || "").trim();
  if (mediaUrl) formData.append("mediaUrl", mediaUrl);

  if (payload.category?.trim()) formData.append("category", payload.category.trim());
  if (payload.type?.trim()) formData.append("type", payload.type.trim());

  const files = payload.files || [];
  files.forEach((file) => formData.append("media[]", file));

  return formData;
}

function buildPostJsonPayload(payload: CreateFeedInput) {
  const text = (payload.content || payload.text || "").trim();
  const category = payload.category?.trim();
  const type = payload.type?.trim();
  const links = (payload.links || []).map((item) => String(item || "").trim()).filter(Boolean);
  const images = (payload.images || []).map((item) => String(item || "").trim()).filter(Boolean);
  const mediaUrl = payload.mediaUrl?.trim();
  return {
    ...(text ? { text } : {}),
    ...(text ? { content: text } : {}),
    linkUrl: payload.linkUrl?.trim() || undefined,
    ...(links.length > 0 ? { links } : {}),
    ...(images.length > 0 ? { images } : {}),
    ...(mediaUrl ? { mediaUrl } : {}),
    ...(category ? { category } : {}),
    ...(type ? { type } : {})
  };
}

const sortByCreatedAt = (items: FeedItem[], sort: FeedListOptions["sort"]) => {
  const sorted = [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return aTime - bTime;
  });
  if (sort === "newest_first") {
    sorted.reverse();
  }
  return sorted;
};

export async function getFeed(options: FeedListOptions = {}): Promise<FeedItem[]> {
  const sort = options.sort || "oldest_first";
  const response = await getByPaths(FEED_LIST_PATHS, { sort });
  const rawItems = extractFeedItems(response.data);
  const normalized = rawItems.map((item, idx) => normalizeFeedItem(item, idx));
  return sortByCreatedAt(normalized, sort);
}

export async function getPostById(idOrSlug: string): Promise<FeedItem | null> {
  const target = String(idOrSlug || "").trim();
  if (!target) return null;

  try {
    const direct = await getByPaths([`/posts/${target}`, `/feed/${target}`]);
    const normalizedDirect = extractSinglePost(direct.data);
    if (normalizedDirect) return normalizedDirect;
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }

  const feed = await getFeed({ sort: "oldest_first" });
  return feed.find((item) => item.id === target || item._id === target || item.slug === target) || null;
}

export async function createFeedPost(payload: CreateFeedInput): Promise<FeedItem> {
  const hasFiles = Array.isArray(payload.files) && payload.files.length > 0;

  if (hasFiles) {
    try {
      const multipart = buildPostFormData(payload);
      const response = await api.post("/posts", multipart);
      return extractSinglePost(response.data) || normalizeFeedItem(response.data, 0);
    } catch (error) {
      if (!isRetryablePostCreateError(error)) {
        throw error;
      }
    }
  }

  const jsonPayload = buildPostJsonPayload(payload);

  try {
    const response = await api.post("/posts", jsonPayload);
    return extractSinglePost(response.data) || normalizeFeedItem(response.data, 0);
  } catch (error) {
    if (!isRetryablePostCreateError(error)) {
      throw error;
    }
  }

  const fallbackResponse = await api.post("/feed", jsonPayload);
  return extractSinglePost(fallbackResponse.data) || normalizeFeedItem(fallbackResponse.data, 0);
}

async function mutatePostReaction(path: string, body: Record<string, unknown> = {}) {
  const response = await api.post(path, body);
  return extractSinglePost(response.data);
}

export async function likePost(postId: string): Promise<FeedItem | null> {
  const target = String(postId || "").trim();
  if (!target) return null;

  try {
    return await mutatePostReaction(`/posts/${target}/like`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  return mutatePostReaction(`/feed/${target}/like`);
}

export async function dislikePost(postId: string): Promise<FeedItem | null> {
  const target = String(postId || "").trim();
  if (!target) return null;

  try {
    return await mutatePostReaction(`/posts/${target}/dislike`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  return mutatePostReaction(`/feed/${target}/dislike`);
}

export async function sharePost(postId: string): Promise<FeedItem | null> {
  const target = String(postId || "").trim();
  if (!target) return null;

  try {
    return await mutatePostReaction(`/posts/${target}/share`);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  return mutatePostReaction(`/feed/${target}/share`);
}

const normalizeComments = (raw: unknown): FeedComment[] => {
  const list = (() => {
    if (Array.isArray(raw)) return raw;
    const record = asRecord(raw);
    if (!record) return [] as unknown[];

    const candidates = [
      record.comments,
      record.items,
      record.data,
      record.data?.comments,
      record.data?.items,
      record.payload,
      record.payload?.comments
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }

    return [] as unknown[];
  })();

  return list.map((item, idx) => normalizeComment(item, idx)).filter((item) => item.text);
};

export async function getPostComments(postId: string): Promise<FeedComment[]> {
  const target = String(postId || "").trim();
  if (!target) return [];

  try {
    const response = await api.get(`/posts/${target}/comments`);
    return normalizeComments(response.data);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  const fallback = await api.get(`/feed/${target}/comments`);
  return normalizeComments(fallback.data);
}

export async function addPostComment(postId: string, text: string): Promise<FeedComment | null> {
  const target = String(postId || "").trim();
  const content = String(text || "").trim();
  if (!target || !content) return null;

  const body = { text: content, content };

  try {
    const response = await api.post(`/posts/${target}/comments`, body);
    const comments = normalizeComments(response.data);
    if (comments.length > 0) return comments[0];
    const post = extractSinglePost(response.data);
    if (post?.comments && post.comments.length > 0) {
      return normalizeComment(post.comments[0], 0);
    }
    return null;
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  const fallback = await api.post(`/feed/${target}/comments`, body);
  const fallbackComments = normalizeComments(fallback.data);
  return fallbackComments[0] || null;
}
