"use client";

import type { ReactNode } from "react";

type UploadFirstCTAProps = {
  title: string;
  description: string;
  badges?: string[];
  action: ReactNode;
  helper?: string;
};

export function UploadFirstCTA({
  title,
  description,
  badges = [],
  action,
  helper
}: UploadFirstCTAProps) {
  return (
    <section className="rounded-[1.7rem] border border-sky-500/25 bg-sky-500/10 p-5 shadow-lg shadow-black/10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-sky-100/90">Workflow</p>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-sky-50/90">{description}</p>
      {badges.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((item) => (
            <span key={item} className="rounded-full border border-sky-400/25 bg-slate-950/35 px-3 py-1 text-[11px] text-sky-100">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-5">{action}</div>
      {helper ? <p className="mt-3 text-xs leading-6 text-sky-50/80">{helper}</p> : null}
    </section>
  );
}
