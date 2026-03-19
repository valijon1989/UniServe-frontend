"use client";

import type { ReactNode } from "react";

export function RequestFormPanel({
  title,
  description,
  children,
  submitLabel,
  onSubmit,
  submitting
}: {
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  submitting?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="space-y-2">{children}</div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Yuborilmoqda..." : submitLabel}
      </button>
    </div>
  );
}
