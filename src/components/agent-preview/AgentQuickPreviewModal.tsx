"use client";

import { useEffect, type ReactNode } from "react";

import { AgentOfferPreviewList } from "@/components/agent-preview/AgentOfferPreviewList";
import { AgentQuickActions } from "@/components/agent-preview/AgentQuickActions";
import { AgentQuickStats } from "@/components/agent-preview/AgentQuickStats";
import { AgentTrustBadges } from "@/components/agent-preview/AgentTrustBadges";
import type { AgentOfferPreview, AgentQuickAction, AgentQuickStat } from "@/components/agent-preview/types";

export function AgentQuickPreviewModal({
  open,
  onClose,
  eyebrow,
  name,
  specialty,
  subtitle,
  image,
  stats,
  trustBadges,
  offers,
  actions,
  children
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  name: string;
  specialty: string;
  subtitle?: string;
  image: string;
  stats: AgentQuickStat[];
  trustBadges: string[];
  offers: AgentOfferPreview[];
  actions: AgentQuickAction[];
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <button type="button" aria-label="Close preview" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/80">{eyebrow}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{name}</h3>
            <p className="text-sm text-slate-300">{specialty}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/25"
          >
            Yopish
          </button>
        </div>

        <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/45">
              <img src={image} alt={name} className="aspect-[16/9] w-full object-cover" />
              <div className="p-4">
                <p className="text-sm font-semibold text-white">{specialty}</p>
                {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p> : null}
              </div>
            </div>
            <AgentQuickStats items={stats} />
            <AgentOfferPreviewList title="Top offers / xizmatlar" items={offers} />
            {children ? <div className="space-y-4">{children}</div> : null}
          </div>

          <div className="space-y-4">
            <section className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Nima qilsa bo'ladi?</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Agentni tez tekshirib, hoziroq xizmat olish, chat boshlash yoki to'liq katalogga o'tish mumkin.
              </p>
              <div className="mt-4">
                <AgentQuickActions actions={actions} />
              </div>
            </section>
            <AgentTrustBadges items={trustBadges} />
          </div>
        </div>
      </div>
    </div>
  );
}
