"use client";

import type { ReactNode } from "react";

type MetaChip = {
  label: string;
  tone?: "emerald" | "sky" | "amber" | "slate";
};

const toneClasses = {
  emerald: "border-emerald-400/20 bg-emerald-500/12 text-emerald-100",
  sky: "border-sky-400/20 bg-sky-500/12 text-sky-100",
  amber: "border-amber-400/20 bg-amber-500/12 text-amber-100",
  slate: "border-white/10 bg-white/6 text-slate-200"
};

const shellToneClasses = {
  default:
    "border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_34%),rgba(2,6,23,0.92)]",
  business:
    "border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_34%),rgba(2,6,23,0.94)]",
  learning:
    "border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_34%),rgba(2,6,23,0.92)]",
  calm:
    "border-sky-200/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(167,243,208,0.14),_transparent_36%),rgba(4,17,34,0.94)]",
  structured:
    "border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.1),_transparent_36%),rgba(3,7,18,0.95)]",
  active:
    "border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_34%),rgba(2,6,23,0.93)]"
};

export function DetailHero({
  eyebrow,
  title,
  subtitle,
  meta = [],
  media,
  aside,
  tone = "default"
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: MetaChip[];
  media?: ReactNode;
  aside?: ReactNode;
  tone?: "default" | "business" | "learning" | "calm" | "structured" | "active";
}) {
  return (
    <section className={`overflow-hidden rounded-[2.25rem] border p-6 shadow-2xl shadow-black/25 md:p-7 ${shellToneClasses[tone]}`}>
      <div className={`grid gap-6 ${aside ? "xl:grid-cols-[minmax(0,1.22fr)_minmax(280px,0.78fr)]" : ""}`}>
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/65">{eyebrow}</p>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-[2.75rem] md:leading-[1.03]">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-200/88 md:text-[15px]">{subtitle}</p>
          </div>

          {meta.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {meta.map((item) => (
                <span
                  key={`${item.label}-${item.tone || "slate"}`}
                  className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold ${toneClasses[item.tone || "slate"]}`}
                >
                  {item.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {aside ? <div className="grid gap-4 self-start">{aside}</div> : null}
      </div>

      {media ? <div className="mt-6">{media}</div> : null}
    </section>
  );
}
