"use client";

import Link from "next/link";
import type { DetailAction } from "@/components/service-detail/types";

type ServiceActionsProps = {
  actions: DetailAction[];
};

export function ServiceActions({ actions }: ServiceActionsProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="space-y-2">
        {actions.map((action) => {
          const className = `inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            action.tone === "secondary"
              ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              : action.tone === "ghost"
                ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
          } ${action.disabled || action.busy ? "cursor-not-allowed opacity-60" : ""}`;

          if (action.href) {
            return (
              <Link
                key={action.key}
                href={action.href}
                className={className}
                aria-disabled={action.disabled}
              >
                {action.busy ? "Yuklanmoqda..." : action.label}
              </Link>
            );
          }

          return (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled || action.busy}
              className={className}
            >
              {action.busy ? "Yuklanmoqda..." : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
