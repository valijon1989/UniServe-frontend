"use client";

import type { ReactNode } from "react";

export function DetailPageShell({
  hero,
  sidebar,
  children
}: {
  hero: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6 md:py-10">
      <div className="rounded-[2.5rem] border border-slate-900/80 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] p-4 shadow-2xl shadow-slate-950/30 md:p-5 xl:p-6">
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,420px)] xl:items-start">
          <div className="min-w-0 space-y-7">
            {hero}
            <div className="space-y-6">{children}</div>
          </div>
          {sidebar ? <aside className="space-y-5 xl:sticky xl:top-24">{sidebar}</aside> : null}
        </div>
      </div>
    </div>
  );
}
