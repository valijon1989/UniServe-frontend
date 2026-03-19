"use client";

import type { ReactNode } from "react";

export function ServiceDetailShell({
  categoryLabel,
  title,
  subtitle,
  hero,
  sidebar,
  highlightChips = [],
  className = "",
  children
}: {
  categoryLabel: string;
  title: string;
  subtitle?: string;
  hero: ReactNode;
  sidebar: ReactNode;
  highlightChips?: string[];
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-8 sm:py-10 ${className}`.trim()}>
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] shadow-2xl shadow-slate-950/30">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(148,163,184,0.05)_100%)]" />
        <div className="relative border-b border-white/10 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/90">{categoryLabel}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.7rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-[15px]">{subtitle}</p>
          ) : null}
          {highlightChips.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {highlightChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {hero}
            {children}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
        </div>
      </section>
    </div>
  );
}
