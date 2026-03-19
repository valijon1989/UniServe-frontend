"use client";

import type { ReactNode } from "react";

type VerticalFilterPanelProps = {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function VerticalFilterPanel({
  title,
  description,
  footer,
  children
}: VerticalFilterPanelProps) {
  return (
    <section className="rounded-[1.8rem] border border-slate-800/80 bg-slate-950/72 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Filters</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        {footer ? <div className="text-xs text-slate-400">{footer}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
