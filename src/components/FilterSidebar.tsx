"use client";

import type { ReactNode } from "react";

export function FilterSidebar({
  title,
  description,
  children,
  footer
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4 xl:sticky xl:top-24">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <div className="space-y-4">{children}</div>
      </section>
      {footer ? (
        <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-sm">{footer}</section>
      ) : null}
    </div>
  );
}

