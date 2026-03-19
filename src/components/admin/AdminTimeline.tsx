"use client";

import type { AdminEntityHistoryItem } from "@/types/admin";
import { formatAdminDate } from "@/lib/adminFormatters";

export function AdminTimeline({
  items,
  emptyLabel = "No recent activity recorded."
}: {
  items?: AdminEntityHistoryItem[];
  emptyLabel?: string;
}) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-4 text-sm text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-100">{item.action}</p>
            <p className="text-xs text-slate-500">{formatAdminDate(item.createdAt)}</p>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {item.actor?.name || item.actor?.role || "System"}
            {item.status ? ` · ${item.status}` : ""}
          </p>
          {item.reason ? <p className="mt-2 text-sm text-slate-300">Reason: {item.reason}</p> : null}
          {item.note ? <p className="mt-1 text-sm text-slate-400">Note: {item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
