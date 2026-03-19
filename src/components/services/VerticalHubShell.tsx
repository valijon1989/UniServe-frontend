"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/context/i18n";

type HighlightTone = "emerald" | "sky" | "amber" | "slate";

type VerticalHubHighlight = {
  label: string;
  value: string;
  tone?: HighlightTone;
};

type VerticalHubShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerAction?: ReactNode;
  highlights?: VerticalHubHighlight[];
  filters?: ReactNode;
  featured?: ReactNode;
  resultsTitle: string;
  resultsMeta?: string;
  pagination?: ReactNode;
  children: ReactNode;
};

const highlightToneClasses: Record<HighlightTone, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  slate: "border-slate-700 bg-slate-900/70 text-slate-200"
};

export function VerticalHubShell({
  eyebrow,
  title,
  subtitle,
  bannerTitle,
  bannerDescription,
  bannerAction,
  highlights,
  filters,
  featured,
  resultsTitle,
  resultsMeta,
  pagination,
  children
}: VerticalHubShellProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%),rgba(2,6,23,0.84)] p-6 shadow-xl shadow-black/20">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/85">{eyebrow}</p>
            <h2 className="max-w-3xl text-2xl font-semibold text-white md:text-[2rem]">{title}</h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">{subtitle}</p>
          </div>

          <div className="rounded-[1.8rem] border border-slate-800/90 bg-slate-950/65 p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-amber-200/85">{bannerTitle}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{bannerDescription}</p>
            {bannerAction ? <div className="mt-4">{bannerAction}</div> : null}
          </div>
        </div>

        {highlights?.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className={`rounded-[1.4rem] border px-4 py-3 ${highlightToneClasses[item.tone || "slate"]}`}
              >
                <p className="text-[11px] uppercase tracking-[0.22em] opacity-75">{item.label}</p>
                <p className="mt-2 text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {filters}
      {featured}

      <section className="rounded-[1.8rem] border border-slate-800 bg-slate-950/68 p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
              {t({ en: "Results", uz: "Natijalar", ru: "Результаты", ko: "결과" })}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-100">{resultsTitle}</h3>
            {resultsMeta ? <p className="mt-1 text-sm text-slate-400">{resultsMeta}</p> : null}
          </div>
          {pagination ? <div className="text-xs text-slate-400">{pagination}</div> : null}
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}
