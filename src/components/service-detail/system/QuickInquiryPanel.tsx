"use client";

import type { ReactNode } from "react";

export function QuickInquiryPanel({
  title,
  description,
  isOpen,
  closedCtaLabel,
  onOpen,
  children
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  closedCtaLabel: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10">
      {isOpen ? (
        children
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
          >
            {closedCtaLabel}
          </button>
        </div>
      )}
    </section>
  );
}
