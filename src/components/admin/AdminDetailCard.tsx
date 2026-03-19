"use client";

import type { ReactNode } from "react";

export function AdminDetailCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      <div className="mt-4 space-y-3">{children}</div>
    </aside>
  );
}
