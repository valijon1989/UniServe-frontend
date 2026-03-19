"use client";

import type { ReactNode } from "react";

interface AdminKeyValueItem {
  label: string;
  value: ReactNode;
}

export function AdminKeyValueList({ items }: { items: AdminKeyValueItem[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
        >
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.label}</span>
          <span className="text-right text-sm text-slate-200">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
