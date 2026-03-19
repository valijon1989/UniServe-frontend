"use client";

import Link from "next/link";

import type { AgentQuickAction } from "@/components/agent-preview/types";

const toneClass: Record<NonNullable<AgentQuickAction["tone"]>, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-400",
  secondary: "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10",
  ghost: "border border-white/10 bg-slate-950/45 text-slate-200 hover:border-white/25",
  danger: "border border-rose-400/25 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
};

export function AgentQuickActions({ actions }: { actions: AgentQuickAction[] }) {
  return (
    <div className="space-y-2">
      {actions.map((action) => {
        const className = `flex w-full items-center justify-center rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition ${
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
          <button key={action.key} type="button" onClick={action.onClick} className={className}>
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
