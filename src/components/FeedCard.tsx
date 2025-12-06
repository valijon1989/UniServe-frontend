import { FeedItem } from "@/api/feed";
import dayjs from "@/lib/dayjs";

interface Props {
  item: FeedItem;
}

export function FeedCard({ item }: Props) {
  const created = dayjs(item.createdAt).fromNow();
  const category = (item?.type || item?.category || "").toLowerCase();
  const content = item.content || item.text || "";
  const rawMedia = item.mediaUrl || item.images?.[0];

  const resolveMedia = (value?: string | null) => {
    if (!value) return null;
    const normalized = value.replace(/^https?:\/\/[^/]+/, "");
    if (normalized.includes("cafe1.jpg")) return "/cafe1.jpg";
    if (normalized.includes("sony_a7iv.jpg")) return "/sony_a7iv.jpg";
    if (normalized.includes("static/posts/cafe1.jpg")) return "/static/posts/cafe1.jpg";
    if (normalized.includes("static/products/sony_a7iv.jpg")) return "/static/products/sony_a7iv.jpg";
    if (/^https?:\/\//.test(value)) return value;
    if (value.startsWith("/")) return value;
    return `/${value}`;
  };

  const mediaUrl = resolveMedia(rawMedia);
  const authorName = item.author?.name || "Foydalanuvchi";
  const authorRole = (item.author?.role || "USER").toString().toLowerCase();

  return (
    <article className="gradient-border relative overflow-hidden rounded-2xl bg-slate-950/70 p-[1px]">
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 p-4">
        <header className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
            {authorName[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-medium text-slate-100">
              {authorName}
            </span>
            <span className="text-xs text-slate-400">
              {authorRole} - {created}
            </span>
          </div>
        </header>

        <p className="mb-3 text-sm text-slate-100 whitespace-pre-wrap">
          {content}
        </p>

        {mediaUrl && (
          <div className="mb-3 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/80">
            <img
              src={mediaUrl}
              alt="post media"
              className="h-64 w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>
        )}

        <footer className="flex items-center gap-4 text-xs text-slate-400">
          <span>Love {item.likesCount}</span>
          <span>Comments {item.commentsCount}</span>
          <span className="ml-auto rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-400">
            {category}
          </span>
        </footer>
      </div>
    </article>
  );
}
