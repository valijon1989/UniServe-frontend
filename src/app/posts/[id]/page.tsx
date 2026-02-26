"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "@/lib/dayjs";
import {
  addPostComment,
  dislikePost,
  getPostById,
  getPostComments,
  likePost,
  sharePost,
  type FeedComment,
  type FeedItem
} from "@/api/feed";
import { IconComment, IconDislike, IconLike, IconShare, type PostReaction } from "@/components/posts/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";
import { useAuthStore } from "@/store/auth";

const toCount = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : fallback;
};

const getLikeCount = (post: FeedItem) => {
  if (typeof post.likesCount === "number") return Math.max(0, post.likesCount);
  if (Array.isArray(post.likes)) return post.likes.length;
  return 0;
};

const getDislikeCount = (post: FeedItem) => {
  if (typeof post.dislikesCount === "number") return Math.max(0, post.dislikesCount);
  if (Array.isArray(post.dislikes)) return post.dislikes.length;
  return 0;
};

const getShareCount = (post: FeedItem) => {
  if (typeof post.sharesCount === "number") return Math.max(0, post.sharesCount);
  if (Array.isArray(post.shares)) return post.shares.length;
  return 0;
};

const getCommentCount = (post: FeedItem) => {
  if (typeof post.commentsCount === "number") return Math.max(0, post.commentsCount);
  if (Array.isArray(post.comments)) return post.comments.length;
  return 0;
};

const normalizeMedia = (value?: string | null) => {
  if (!value) return null;
  return toAbsoluteMediaUrl(value) || null;
};

const isVideo = (value: string) => {
  return /^data:video\//i.test(value) || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(value) || /youtube\.com|youtu\.be|vimeo\.com/i.test(value);
};

const isImage = (value: string) => {
  return /^data:image\//i.test(value) || /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(value);
};

const getPostId = (post: FeedItem) => String(post.id || post._id || post.slug || "");

export default function PostDetailPage() {
  const params = useParams();
  const idOrSlug = typeof params?.id === "string" ? params.id : String(params?.id || "");
  const { isHydrated, isAuthenticated, hydrateFromStorage } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<FeedItem | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [reaction, setReaction] = useState<PostReaction>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [pendingAction, setPendingAction] = useState<"like" | "dislike" | "share" | "comment" | null>(null);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      setLoading(false);
      setPost(null);
      setComments([]);
      return;
    }

    let active = true;

    const load = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const loadedPost = await getPostById(idOrSlug);
        if (!active) return;
        if (!loadedPost) {
          setPost(null);
          setComments([]);
          return;
        }

        setPost(loadedPost);
        setLikes(getLikeCount(loadedPost));
        setDislikes(getDislikeCount(loadedPost));
        setShares(getShareCount(loadedPost));
        setCommentsCount(getCommentCount(loadedPost));

        try {
          const loadedComments = await getPostComments(getPostId(loadedPost));
          if (!active) return;
          setComments(loadedComments);
          setCommentsCount((prev) => Math.max(prev, loadedComments.length));
        } catch {
          if (!active) return;
          setComments([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [idOrSlug, isAuthenticated, isHydrated]);

  const mediaItems = useMemo(() => {
    if (!post) return [] as string[];
    return Array.from(
      new Set(
        [post.mediaUrl, ...(post.images || [])]
          .map((item) => normalizeMedia(item))
          .filter((item): item is string => Boolean(item))
      )
    );
  }, [post]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!post) return;
    const postId = getPostId(post);
    if (!postId) return;

    const prevReaction = reaction;
    const prevLikes = likes;
    const prevDislikes = dislikes;
    const nextReaction: PostReaction = reaction === type ? null : type;

    let nextLikes = prevLikes;
    let nextDislikes = prevDislikes;

    if (prevReaction === "like") nextLikes = Math.max(0, nextLikes - 1);
    if (prevReaction === "dislike") nextDislikes = Math.max(0, nextDislikes - 1);
    if (nextReaction === "like") nextLikes += 1;
    if (nextReaction === "dislike") nextDislikes += 1;

    setReaction(nextReaction);
    setLikes(nextLikes);
    setDislikes(nextDislikes);
    setPendingAction(type);

    try {
      const updated = type === "like" ? await likePost(postId) : await dislikePost(postId);
      if (updated) {
        setPost((prev) => (prev ? { ...prev, ...updated } : prev));
        setLikes(toCount(updated.likesCount, nextLikes));
        setDislikes(toCount(updated.dislikesCount, nextDislikes));
        setShares(toCount(updated.sharesCount, shares));
        setCommentsCount(toCount(updated.commentsCount, commentsCount));
      }
    } catch {
      setReaction(prevReaction);
      setLikes(prevLikes);
      setDislikes(prevDislikes);
    } finally {
      setPendingAction(null);
    }
  };

  const handleShare = async () => {
    if (!post || typeof window === "undefined") return;
    const postId = getPostId(post);
    if (!postId) return;

    const url = `${window.location.origin}/posts/${postId}`;
    const shareText = (post.content || post.text || "").trim().slice(0, 140);

    try {
      if (navigator.share) {
        await navigator.share({ title: "UniServe post", text: shareText, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      return;
    }

    const previousShares = shares;
    setShares((prev) => prev + 1);
    setPendingAction("share");

    try {
      const updated = await sharePost(postId);
      if (updated) {
        setPost((prev) => (prev ? { ...prev, ...updated } : prev));
        setShares(toCount(updated.sharesCount, previousShares + 1));
        setLikes(toCount(updated.likesCount, likes));
        setDislikes(toCount(updated.dislikesCount, dislikes));
        setCommentsCount(toCount(updated.commentsCount, commentsCount));
      }
    } catch {
      setShares(previousShares);
    } finally {
      setPendingAction(null);
    }
  };

  const handleAddComment = async () => {
    if (!post) return;
    const postId = getPostId(post);
    if (!postId) return;

    const text = commentDraft.trim();
    if (!text) return;

    setPendingAction("comment");
    try {
      const created = await addPostComment(postId, text);
      if (created) {
        setComments((prev) => [created, ...prev]);
      } else {
        const fallbackComment: FeedComment = {
          id: `local-${Date.now()}`,
          text,
          content: text,
          createdAt: new Date().toISOString(),
          author: {
            name: "Siz",
            username: "me"
          }
        };
        setComments((prev) => [fallbackComment, ...prev]);
      }
      setCommentDraft("");
      setCommentsCount((prev) => prev + 1);
    } finally {
      setPendingAction(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Yuklanmoqda...</p>;
  }

  if (isHydrated && !isAuthenticated) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-center shadow-lg shadow-black/20">
        <h1 className="text-lg font-semibold text-slate-100">Login required</h1>
        <p className="mt-2 text-sm text-slate-400">Postni ko'rish va muhokama uchun tizimga kirishingiz kerak.</p>
        <div className="mt-4">
          <Link href="/login" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-100/40 px-6 py-10 text-center text-slate-600">
        Post topilmadi.
      </div>
    );
  }

  const title = post.content || post.text || "Post";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Post detail</p>
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <Avatar
              src={post.author?.avatarUrl}
              alt={post.author?.name || post.author?.username || "Foydalanuvchi"}
              fallbackText={post.author?.username || post.author?.name || "Foydalanuvchi"}
              size={26}
              className="border border-slate-700/70"
            />
            <p>
              {(post.author?.username || post.author?.name || "Foydalanuvchi")} · {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>
        <Link href="/news" className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200">
          Lenta sahifasiga qaytish
        </Link>
      </div>

      {mediaItems.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {mediaItems.slice(0, 4).map((src) => {
            if (isImage(src)) {
              return <img key={src} src={src} alt="Post media" className="h-72 w-full rounded-2xl object-cover" />;
            }
            if (isVideo(src) && !/youtube\.com|youtu\.be|vimeo\.com/i.test(src)) {
              return <video key={src} controls className="h-72 w-full rounded-2xl bg-black object-contain" src={src} />;
            }
            return (
              <Link
                key={src}
                href={src}
                target="_blank"
                className="flex h-72 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-sm text-sky-300"
              >
                Media ochish
              </Link>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-200">
        {post.content || post.text || "Matn yo'q."}
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleReaction("like")}
            disabled={pendingAction === "like"}
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
            onClick={() => handleReaction("dislike")}
            disabled={pendingAction === "dislike"}
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
            onClick={handleShare}
            disabled={pendingAction === "share"}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 transition hover:border-slate-500 disabled:opacity-60"
            aria-label="Share"
          >
            <IconShare />
            <span className="text-slate-200">{shares}</span>
          </button>

          <Link
            href="#comments"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 transition hover:border-slate-500"
            aria-label="Comments"
          >
            <IconComment />
            <span className="text-slate-200">{commentsCount}</span>
          </Link>
        </div>
      </section>

      <section id="comments" className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-100">Muhokamalar</h2>
          <span className="text-xs text-slate-400">{commentsCount} ta</span>
        </div>

        {comments.length === 0 ? (
          <p className="text-sm text-slate-400">Hozircha izoh yo'q. Birinchi bo'lib fikr qoldiring.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((item, idx) => (
              <article key={`${item.id || item._id || idx}`} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Avatar
                    src={item.author?.avatarUrl}
                    alt={item.author?.name || item.author?.username || "Foydalanuvchi"}
                    fallbackText={item.author?.username || item.author?.name || "Foydalanuvchi"}
                    size={28}
                    className="border border-slate-700/70"
                  />
                  <p>
                    {item.author?.username || item.author?.name || "Foydalanuvchi"} · {dayjs(item.createdAt).fromNow()}
                  </p>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{item.text || item.content}</p>
              </article>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            placeholder="Muhokama uchun fikringizni yozing..."
            className="h-24 w-full rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddComment}
              disabled={pendingAction === "comment"}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
            >
              Izoh qoldirish
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
