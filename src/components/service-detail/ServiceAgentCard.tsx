"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { DetailContactMethod, DetailTrustIndicator } from "@/components/service-detail/types";

type ServiceAgentCardProps = {
  avatarSrc?: string | null;
  fallbackText: string;
  name: string;
  handle?: string | null;
  roleLabel?: string | null;
  rating: number;
  verified?: boolean;
  completedJobs: number;
  contacts: DetailContactMethod[];
  trustIndicators: DetailTrustIndicator[];
};

const toneClassMap: Record<NonNullable<DetailTrustIndicator["tone"]>, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700"
};

export function ServiceAgentCard({
  avatarSrc,
  fallbackText,
  name,
  handle,
  roleLabel,
  rating,
  verified = false,
  completedJobs,
  contacts,
  trustIndicators
}: ServiceAgentCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar
          src={avatarSrc || undefined}
          alt={name}
          fallbackText={fallbackText}
          size={60}
          className="border border-slate-200"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold text-slate-950">{name}</h2>
            {verified ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                Verified
              </span>
            ) : null}
          </div>
          {handle ? <p className="text-sm text-slate-500">@{handle}</p> : null}
          {roleLabel ? <p className="mt-1 text-sm text-slate-600">{roleLabel}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Reyting</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{rating.toFixed(1)} / 5</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Bajarilgan ishlar</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{completedJobs}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bog'lanish</p>
          <div className="mt-3 space-y-2">
            {contacts.map((item) => {
              const content = (
                <span className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                  <span>{item.label}</span>
                  <span className={`font-semibold ${item.locked ? "text-slate-400" : "text-slate-950"}`}>
                    {item.value}
                  </span>
                </span>
              );

              if (item.href && !item.locked) {
                return (
                  <a key={item.key} href={item.href} className="block hover:-translate-y-0.5 transition">
                    {content}
                  </a>
                );
              }

              return <div key={item.key}>{content}</div>;
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ishonch indikatorlari</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {trustIndicators.map((item) => (
              <span
                key={`${item.label}-${item.value}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  item.tone ? toneClassMap[item.tone] : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
