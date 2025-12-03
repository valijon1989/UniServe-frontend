export type PostType = "PHOTO" | "VIDEO" | "ARTICLE";

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "USER" | "AGENT";
  authorAvatarUrl?: string;
  createdAt: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: PostType;
  isPrivate?: boolean;
  likeCount?: number;
  commentCount?: number;
}
