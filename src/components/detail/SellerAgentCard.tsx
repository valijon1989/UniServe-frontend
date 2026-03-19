"use client";

import { Avatar } from "@/components/ui/Avatar";

type MetaRow = {
  label: string;
  value: string;
};

type MetricChip = {
  label: string;
  value: string;
};

export function SellerAgentCard({
  avatarSrc,
  avatarAlt,
  fallbackText,
  name,
  username,
  badge,
  trustLine,
  metaRows,
  metrics
}: {
  avatarSrc?: string | null;
  avatarAlt?: string;
  fallbackText: string;
  name: string;
  username?: string | null;
  badge?: string | null;
  trustLine?: string | null;
  metaRows?: MetaRow[];
  metrics?: MetricChip[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={avatarSrc || undefined}
          alt={avatarAlt || name}
          fallbackText={fallbackText}
          size={52}
          className="border border-slate-200"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            {badge && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">{badge}</span>}
          </div>
          {username && <p className="truncate text-xs text-slate-500">@{username}</p>}
          {trustLine && <p className="mt-1 text-xs text-slate-600">{trustLine}</p>}
        </div>
      </div>

      {metaRows && metaRows.length > 0 && (
        <div className="space-y-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
          {metaRows.map((item) => (
            <div key={`${item.label}:${item.value}`} className="flex items-center justify-between gap-3">
              <span className="text-slate-500">{item.label}</span>
              <span className="text-right font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {metrics && metrics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metrics.map((item) => (
            <span key={`${item.label}:${item.value}`} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
