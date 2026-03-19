"use client";

import Link from "next/link";

import type { SystemAction, SystemUtilityAction } from "@/components/service-detail/system/types";

const toneClass: Record<NonNullable<SystemAction["tone"]>, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-400",
  secondary: "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10",
  ghost: "border border-white/10 bg-slate-950/45 text-slate-200 hover:border-white/25 hover:bg-slate-950/70",
  danger: "border border-rose-400/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
};

export function PrimaryActionPanel({
  title = "Primary actions",
  subtitle,
  status,
  actions,
  utilityActions = []
}: {
  title?: string;
  subtitle?: string;
  status?: string | null;
  actions: SystemAction[];
  utilityActions?: SystemUtilityAction[];
}) {
  return (
    <section className="rounded-[1.85rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/15 backdrop-blur">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Action hierarchy</p>
        <p className="mt-2 text-lg font-semibold text-white">{title}</p>
        {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p> : null}
        {status ? <p className="mt-2 text-xs font-medium text-emerald-200">{status}</p> : null}
      </div>
      <div className="mt-4 space-y-2">
        {actions.map((action) => {
          const className = `flex w-full items-center justify-center rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            toneClass[action.tone || "primary"]
          }`;

          if (action.href) {
            return (
              <Link key={action.key} href={action.href} className={className}>
                {action.label}
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
              {action.busy ? "Yuborilmoqda..." : action.label}
            </button>
          );
        })}
      </div>
      {utilityActions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {utilityActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                action.active
                  ? "border-amber-300/40 bg-amber-500/15 text-amber-100"
                  : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-white/25"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
