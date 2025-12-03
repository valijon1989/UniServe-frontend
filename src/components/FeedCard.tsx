import { FeedItem } from "@/api/feed";
import dayjs from "dayjs";

interface Props {
  item: FeedItem;
}

export function FeedCard({ item }: Props) {
  const created = dayjs(item.createdAt).fromNow();

  return (
    <article className="gradient-border relative overflow-hidden rounded-2xl bg-slate-950/70 p-[1px]">
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 p-4">
        <header className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
            {item.author.name[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-medium text-slate-100">
              {item.author.name}
            </span>
            <span className="text-xs text-slate-400">
              {item.author.role.toLowerCase()} · {created}
            </span>
          </div>
        </header>

        <p className="mb-3 text-sm text-slate-100 whitespace-pre-wrap">
          {item.text}
        </p>

        {item.mediaUrl && (
          <div className="mb-3 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/80">
            <img
              src={item.mediaUrl}
              alt="post media"
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        <footer className="flex items-center gap-4 text-xs text-slate-400">
          <span>❤️ {item.likesCount}</span>
          <span>💬 {item.commentsCount}</span>
          <span className="ml-auto rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-400">
            {item.type.toLowerCase()}
          </span>
        </footer>
      </div>
    </article>
  );
}
