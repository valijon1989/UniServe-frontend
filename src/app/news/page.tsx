"use client";

import { useMemo, useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { createFeedPost, getFeed, type FeedItem } from "@/api/feed";
import { getApiOrigin, normalizeImageUrl } from "@/lib/imageUrl";

type SocialPost = FeedItem & { id: string };
type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
};
const LOCAL_NEWS_POSTS_KEY = "local-news-social-posts";

const BLOCKED_POST_KEYWORDS = [
  "product",
  "products",
  "mahsulot",
  "mahsulotlar",
  "service",
  "services",
  "xizmat",
  "xizmatlar",
  "listing",
  "e'lon",
  "elon",
  "sale",
  "discount",
  "chegirma",
  "shop",
  "catalog"
];

const URL_RE = /(https?:\/\/[^\s]+)/gi;

const isVideoUrl = (url: string) =>
  /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url);

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url);
const MAX_UPLOAD_FILES = 4;
const MAX_UPLOAD_SIZE_MB = 20;

const normalizeMediaUrl = (value?: string | null) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${getApiOrigin()}${value}`;
  return normalizeImageUrl(value);
};

const extractUrls = (text?: string) => {
  if (!text) return [];
  return Array.from(new Set((text.match(URL_RE) || []).map((u) => u.trim())));
};

const isProductOrServiceRelated = (post: FeedItem) => {
  const haystack = [
    post.type,
    post.category,
    post.text,
    post.content
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (BLOCKED_POST_KEYWORDS.some((keyword) => haystack.includes(keyword))) return true;
  if (haystack.includes("/products/") || haystack.includes("/services/")) return true;
  return false;
};

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return "Yaqinda";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hozirgina";
  if (mins < 60) return `${mins} daqiqa avval`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat avval`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} kun avval`;
  return d.toLocaleDateString("uz-UZ");
};

export default function NewsPage() {
  const [items, setItems] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [draftText, setDraftText] = useState("");
  const [mediaInput, setMediaInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizePost = (post: FeedItem, idx = 0): SocialPost => ({
    ...post,
    id: String(post.id || post._id || `post-${idx}`)
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const feed = await getFeed();
        const localRaw =
          typeof window !== "undefined" ? window.localStorage.getItem(LOCAL_NEWS_POSTS_KEY) : null;
        const localPosts: FeedItem[] = localRaw ? JSON.parse(localRaw) : [];
        if (!active) return;
        const normalized = [...localPosts, ...(feed || [])]
          .map((post, idx) => normalizePost(post, idx))
          .filter((post) => !isProductOrServiceRelated(post))
          .sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
          });
        setItems(normalized);
      } catch (err) {
        console.error("News feed load error", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [uploads]);

  const addChip = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    const clean = value.trim();
    if (!clean) return;
    if (!/^https?:\/\//i.test(clean)) return;
    setter((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  };

  const persistLocalPost = (post: FeedItem) => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(LOCAL_NEWS_POSTS_KEY);
    const list: FeedItem[] = raw ? JSON.parse(raw) : [];
    const next = [post, ...list].slice(0, 100);
    window.localStorage.setItem(LOCAL_NEWS_POSTS_KEY, JSON.stringify(next));
  };

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("file-read-error"));
      reader.readAsDataURL(file);
    });

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const tooBig = incoming.find((f) => f.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setPostError(`Har bir fayl ${MAX_UPLOAD_SIZE_MB}MB dan kichik bo‘lishi kerak.`);
      return;
    }
    setPostError(null);
    setUploads((prev) => {
      const room = Math.max(0, MAX_UPLOAD_FILES - prev.length);
      if (room === 0) return prev;
      const accepted = incoming.slice(0, room).map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      return [...prev, ...accepted];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((u) => u.id !== id);
    });
  };

  const handlePublish = async () => {
    const text = draftText.trim();
    const allLinks = [...links, ...extractUrls(text)].filter(Boolean);
    if (!text && mediaUrls.length === 0 && allLinks.length === 0 && uploads.length === 0) {
      setPostError("Kamida matn, media yoki havola kiriting.");
      return;
    }
    setPostError(null);
    setPosting(true);
    const uploadedDataUrls = await Promise.all(uploads.map((u) => toDataUrl(u.file).catch(() => "")));
    const uploadedMedia = uploadedDataUrls.filter(Boolean);
    const finalMediaUrls = [...mediaUrls, ...uploadedMedia];
    const composedText = [text, ...links].filter(Boolean).join("\n");
    const optimistic: SocialPost = normalizePost(
      {
        _id: `local-${Date.now()}`,
        text: composedText,
        content: composedText,
        category: "social",
        type: "social",
        images: finalMediaUrls.filter((u) => isImageUrl(u)),
        mediaUrl: finalMediaUrls[0],
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        author: { name: "Siz", role: "USER" }
      },
      0
    );

    try {
      const created = await createFeedPost({
        text: composedText,
        content: composedText,
        category: "social",
        type: "social",
        images: finalMediaUrls.filter((u) => isImageUrl(u)),
        mediaUrl: finalMediaUrls[0]
      });
      setItems((prev) => [normalizePost(created), ...prev]);
    } catch {
      persistLocalPost(optimistic);
      setItems((prev) => [optimistic, ...prev]);
    } finally {
      setPosting(false);
      setDraftText("");
      setMediaUrls([]);
      setLinks([]);
      setMediaInput("");
      setLinkInput("");
      uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setUploads([]);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.trim().toLowerCase();
    return items.filter((post) => {
      return [post.text, post.content, post.author?.name, post.category, post.type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [items, search]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-black/30">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-200">News / Social</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">Erkin postlar lentasi</h1>
        <p className="mt-2 text-sm text-slate-300">
          Bu bo‘limda faqat erkin postlar ko‘rinadi. Mahsulot yoki xizmatga oid e’lonlar chiqarib tashlangan.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Post matni, muallif yoki kategoriya bo‘yicha qidiring..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30 md:max-w-xl"
          />
          <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-800">
            {filtered.length} post
          </span>
        </div>
      </div>

      <section className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/25">
        <p className="text-sm font-semibold text-slate-100">Yangi post joylash</p>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Post matni..."
          className="h-24 w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30"
        />
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex gap-2">
            <input
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              placeholder="Rasm/Video URL"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                addChip(mediaInput, setMediaUrls);
                setMediaInput("");
              }}
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200"
            >
              Qo‘shish
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Havola / maqola URL"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                addChip(linkInput, setLinks);
                setLinkInput("");
              }}
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200"
            >
              Qo‘shish
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200"
          >
            📎 Fayl yuklash (image/video)
          </button>
          <span className="text-xs text-slate-400">
            Maksimum {MAX_UPLOAD_FILES} ta fayl, har biri {MAX_UPLOAD_SIZE_MB}MB gacha
          </span>
        </div>
        {uploads.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {uploads.map((u) => (
              <div key={u.id} className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                {u.file.type.startsWith("video/") ? (
                  <video src={u.previewUrl} className="h-32 w-full object-cover" />
                ) : (
                  <img src={u.previewUrl} alt={u.file.name} className="h-32 w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeUpload(u.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white"
                >
                  ✕
                </button>
                <p className="truncate px-2 py-1 text-[11px] text-slate-300">{u.file.name}</p>
              </div>
            ))}
          </div>
        )}
        {(mediaUrls.length > 0 || links.length > 0) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {mediaUrls.map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => setMediaUrls((prev) => prev.filter((x) => x !== u))}
                className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-300 ring-1 ring-slate-700"
              >
                🎞 {u}
              </button>
            ))}
            {links.map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => setLinks((prev) => prev.filter((x) => x !== u))}
                className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-300 ring-1 ring-slate-700"
              >
                🔗 {u}
              </button>
            ))}
          </div>
        )}
        {postError && <p className="text-xs text-red-400">{postError}</p>}
        <div className="flex justify-end">
          <button
            type="button"
            disabled={posting}
            onClick={handlePublish}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {posting ? "Joylanmoqda..." : "Post joylash"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {loading && <p className="text-sm text-slate-400">Yuklanmoqda...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-400">Hozircha mos postlar yo‘q.</p>
        )}

        {filtered.map((post) => {
          const text = post.content || post.text || "";
          const urls = extractUrls(text);
          const media = Array.from(
            new Set(
              [post.mediaUrl, ...(post.images || [])]
                .map((m) => normalizeMediaUrl(m))
                .filter((m): m is string => Boolean(m))
            )
          );

          const images = media.filter((m) => isImageUrl(m));
          const videos = media.filter((m) => isVideoUrl(m));
          const articleLinks = urls.filter((u) => !isImageUrl(u) && !isVideoUrl(u));
          const likes = post.likesCount ?? (Array.isArray(post.likes) ? post.likes.length : 0);
          const comments = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);

          return (
            <article
              key={post.id}
              className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/25"
            >
              <div className="flex items-center gap-3">
                <img
                  src={normalizeMediaUrl(post.author?.avatarUrl) || "/avatars/agent-01.jpg"}
                  alt={post.author?.name || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">{post.author?.name || "Foydalanuvchi"}</p>
                  <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
                </div>
                <span className="ml-auto rounded-full bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-slate-800">
                  Post
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{text || "Matn yo‘q."}</p>

              {images.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {images.slice(0, 4).map((src) => (
                    <img key={src} src={src} alt="post media" className="h-48 w-full rounded-xl object-cover" />
                  ))}
                </div>
              )}

              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.slice(0, 2).map((src) =>
                    /youtube\.com|youtu\.be|vimeo\.com/i.test(src) ? (
                      <Link
                        key={src}
                        href={src}
                        target="_blank"
                        className="block rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-sky-300 hover:border-sky-500/60"
                      >
                        🎥 Video havola ochish
                      </Link>
                    ) : (
                      <video key={src} controls className="h-64 w-full rounded-xl bg-black" src={src} />
                    )
                  )}
                </div>
              )}

              {articleLinks.length > 0 && (
                <div className="space-y-2">
                  {articleLinks.slice(0, 3).map((url) => (
                    <Link
                      key={url}
                      href={url}
                      target="_blank"
                      className="block truncate rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-sky-300 hover:border-sky-500/60"
                    >
                      🔗 {url}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>❤️ {likes}</span>
                <span>💬 {comments}</span>
                <Link href={`/posts/${post.id}`} className="ml-auto text-sky-300 hover:text-sky-200">
                  Batafsil
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
