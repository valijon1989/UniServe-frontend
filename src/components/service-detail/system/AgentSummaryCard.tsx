"use client";

import { Avatar } from "@/components/ui/Avatar";

import type { DetailContactMethod } from "@/components/service-detail/types";
import type { SystemMetaRow } from "@/components/service-detail/system/types";

export function AgentSummaryCard({
  avatarSrc,
  avatarAlt,
  fallbackText,
  name,
  username,
  specialty,
  badge,
  trustLine,
  metaRows = [],
  metrics = [],
  contacts = []
}: {
  avatarSrc?: string | null;
  avatarAlt?: string;
  fallbackText: string;
  name: string;
  username?: string | null;
  specialty?: string;
  badge?: string | null;
  trustLine?: string | null;
  metaRows?: SystemMetaRow[];
  metrics?: Array<{ label: string; value: string }>;
  contacts?: DetailContactMethod[];
}) {
  return (
    <section className="rounded-[1.85rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/15 backdrop-blur">
      <div className="flex items-start gap-3">
        <Avatar
          src={avatarSrc || undefined}
          alt={avatarAlt || name}
          fallbackText={fallbackText}
          size={60}
          className="border border-white/15"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-semibold text-white">{name}</p>
            {badge ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                {badge}
              </span>
            ) : null}
          </div>
          {username ? <p className="truncate text-xs text-slate-400">@{username}</p> : null}
          {specialty ? <p className="mt-2 text-sm text-slate-200">{specialty}</p> : null}
          {trustLine ? <p className="mt-1 text-xs text-slate-400">{trustLine}</p> : null}
        </div>
      </div>

      {metaRows.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-[1.4rem] border border-white/10 bg-slate-950/45 p-4 text-sm">
          {metaRows.map((item) => (
            <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-3">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-right font-medium text-white">{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {metrics.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-2">
          {metrics.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-[1.15rem] border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {contacts.length > 0 ? (
        <div className="mt-4 space-y-2">
          {contacts.map((contact) =>
            contact.href && !contact.locked ? (
              <a
                key={contact.key}
                href={contact.href}
                className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-slate-950/45 px-3 py-3 text-sm text-slate-200 transition hover:border-white/20"
              >
                <span>{contact.label}</span>
                <span className="font-semibold text-white">{contact.value}</span>
              </a>
            ) : (
              <div
                key={contact.key}
                className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-slate-950/45 px-3 py-3 text-sm text-slate-200"
              >
                <span>{contact.label}</span>
                <span className="text-right font-semibold text-white">{contact.value}</span>
              </div>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}
