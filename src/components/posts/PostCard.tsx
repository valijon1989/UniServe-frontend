"use client";

import Link from "next/link";
import dayjs from "@/lib/dayjs";
import type { FeedItem } from "@/api/feed";
import { Avatar } from "@/components/ui/Avatar";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";

export type PostReaction = "like" | "dislike" | null;

export interface PostCardProps {
  post: FeedItem;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  reaction: PostReaction;
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
  onComment: () => void;
}

const isVideoUrl = (value: string) => {
  return /^data:video\//i.test(value) || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(value) || /youtube\.com|youtu\.be|vimeo\.com/i.test(value);
};

const isImageUrl = (value: string) => {
  return /^data:image\//i.test(value) || /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(value);
};

const normalizeMedia = (value?: string | null) => {
  if (!value) return null;
  return toAbsoluteMediaUrl(value) || null;
};

function IconLike({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${active ? "text-emerald-300" : "text-slate-300"}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 9V5.5A2.5 2.5 0 0 0 11.5 3L7 10v10h10.2a2 2 0 0 0 1.9-1.4l1.7-6A2 2 0 0 0 19 10h-5z" />
      <path d="M7 10H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" />
    </svg>
  );
}

function IconDislike({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${active ? "text-rose-300" : "text-slate-300"}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 15v3.5A2.5 2.5 0 0 0 12.5 21L17 14V4H6.8a2 2 0 0 0-1.9 1.4l-1.7 6A2 2 0 0 0 5 14h5z" />
      <path d="M17 14h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 11.5a8.5 8.5 0 1 1-4.4-7.4" />
      <path d="M8 22l3.2-2" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function PostCard({ post, likes, dislikes, comments, shares, reaction, onLike, onDislike, onShare, onComment }: PostCardProps) {
  const authorName = post.author?.username || post.author?.name || "Foydalanuvchi";
  const content = (post.content || post.text || "").trim();
  const media = Array.from(
    new Set(
      [post.mediaUrl, ...(post.images || [])]
        .map((item) => normalizeMedia(item))
        .filter((item): item is string => Boolean(item))
    )
  );

  return (
    <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/25">
      <div className="flex items-center gap-3">
        <Avatar
          src={post.author?.avatarUrl}
          alt={authorName}
          fallbackText={authorName}
          size={40}
          className="border border-slate-700/70"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{authorName}</p>
          <p className="text-xs text-slate-400">{dayjs(post.createdAt).fromNow()}</p>
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{content || "Matn yo'q."}</p>

      {media.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {media.slice(0, 4).map((src) => {
            const image = isImageUrl(src);
            const video = isVideoUrl(src);
            if (image) {
              return <img key={src} src={src} alt="post media" className="h-48 w-full rounded-xl object-cover" />;
            }
            if (video && !/youtube\.com|youtu\.be|vimeo\.com/i.test(src)) {
              return <video key={src} controls className="h-48 w-full rounded-xl bg-black object-cover" src={src} />;
            }
            return (
              <Link
                key={src}
                href={src}
                target="_blank"
                className="flex h-48 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-sky-300"
              >
                Media ochish
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={onLike}
          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 transition ${
            reaction === "like" ? "border-emerald-500/70 bg-emerald-500/10" : "border-slate-700 bg-slate-900/70"
          }`}
          aria-label="Like"
        >
          <IconLike active={reaction === "like"} />
          <span className="text-slate-200">{likes}</span>
        </button>

        <button
          type="button"
          onClick={onDislike}
          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 transition ${
            reaction === "dislike" ? "border-rose-500/70 bg-rose-500/10" : "border-slate-700 bg-slate-900/70"
          }`}
          aria-label="Dislike"
        >
          <IconDislike active={reaction === "dislike"} />
          <span className="text-slate-200">{dislikes}</span>
        </button>

        <button
          type="button"
          onClick={onComment}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 transition hover:border-slate-500"
          aria-label="Comments"
        >
          <IconComment />
          <span className="text-slate-200">{comments}</span>
        </button>

        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 transition hover:border-slate-500"
          aria-label="Share"
        >
          <IconShare />
          <span className="text-slate-200">{shares}</span>
        </button>

        <Link href={`/posts/${post.id || post._id || ""}`} className="ml-auto text-sm text-sky-300 hover:text-sky-200">
          Batafsil
        </Link>
      </div>
    </article>
  );
}

export { IconLike, IconDislike, IconComment, IconShare };
