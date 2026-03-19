"use client";

import type { ReactNode } from "react";

export function DetailActionSidebar({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <aside className={`space-y-4 lg:sticky lg:top-24 ${className}`.trim()}>{children}</aside>;
}

export function DetailSidebarCard({
  title,
  subtitle,
  children,
  className = ""
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white/88 p-4 shadow-sm ${className}`.trim()}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
