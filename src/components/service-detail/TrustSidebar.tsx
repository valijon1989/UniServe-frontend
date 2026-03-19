"use client";

import type { ReactNode } from "react";

type TrustSidebarItem = {
  label: string;
  value: string;
};

type TrustSidebarProps = {
  title: string;
  description?: string;
  items: TrustSidebarItem[];
  footer?: ReactNode;
};

export function TrustSidebar({ title, description, items, footer }: TrustSidebarProps) {
  return (
    <section className="rounded-[1.9rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/15 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.28em] text-sky-200/80">Trust sidebar</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {items.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="rounded-[1.35rem] border border-white/10 bg-slate-950/55 p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{item.value}</p>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}
