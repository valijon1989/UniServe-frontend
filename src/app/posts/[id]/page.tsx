"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getFeed, type FeedItem } from "@/api/feed";
import dayjs from "@/lib/dayjs";

export default function PostDetailPage() {
  const params = useParams();
  const postId = typeof params?.id === "string" ? params.id : String(params?.id || "");
  const [post, setPost] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const items = await getFeed();
        const found =
          items.find((item) => item.id === postId || item._id === postId) || null;
        if (active) setPost(found);
      } catch (err) {
        if (active) setPost(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (postId) load();
    return () => {
      active = false;
    };
  }, [postId]);

  if (loading) {
    return <p className="text-sm text-slate-400">Yuklanmoqda...</p>;
  }

  if (!post) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-slate-600 shadow-sm">
        Elon topilmadi.
      </div>
    );
  }

  const media = post.mediaUrl || post.images?.[0];
  const created = dayjs(post.createdAt).fromNow();
  const likes = post.likesCount ?? (Array.isArray(post.likes) ? post.likes.length : 0);
  const comments = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Elon</p>
          <h1 className="text-2xl font-bold text-slate-100">
            {post.content || post.text || "Post"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {post.author?.name || "Foydalanuvchi"} · {created}
          </p>
        </div>
        <Link
          href="/news"
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200"
        >
          Lenta sahifasiga qaytish
        </Link>
      </div>

      {media && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
          <img
            src={media}
            alt="post media"
            className="h-72 w-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-200">
        {post.content || post.text || "Matn yo'q."}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
        <span>❤️ {likes}</span>
        <span>💬 {comments}</span>
        {(post.category || post.type) && (
          <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
            {post.category || post.type}
          </span>
        )}
      </div>
    </div>
  );
}
