"use client";

import { Avatar } from "@/components/ui/Avatar";

export function ProviderMiniCard({
  avatarSrc,
  name,
  username,
  specialty,
  badge,
  trustLine,
  highlights = []
}: {
  avatarSrc?: string | null;
  name: string;
  username?: string | null;
  specialty?: string | null;
  badge?: string | null;
  trustLine?: string | null;
  highlights?: string[];
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4 shadow-lg shadow-black/15 backdrop-blur">
      <div className="flex items-start gap-3">
        <Avatar
          src={avatarSrc || undefined}
          alt={name}
          fallbackText={name}
          size={56}
          className="border border-white/15"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-white">{name}</p>
            {badge ? (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-100">
                {badge}
              </span>
            ) : null}
          </div>
          {username ? <p className="truncate text-xs text-slate-400">@{username}</p> : null}
          {specialty ? <p className="mt-2 text-sm text-slate-200">{specialty}</p> : null}
          {trustLine ? <p className="mt-1 text-xs text-slate-400">{trustLine}</p> : null}
        </div>
      </div>

      {highlights.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
