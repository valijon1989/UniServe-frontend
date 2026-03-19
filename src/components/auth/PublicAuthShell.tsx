import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Highlight = {
  title: string;
  description: string;
};

type Stat = {
  value: string;
  label: string;
};

export function PublicAuthShell({
  badge,
  title,
  description,
  highlights,
  stats,
  children
}: {
  badge: string;
  title: string;
  description: string;
  highlights: Highlight[];
  stats: Stat[];
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7ee_0%,#f8f3ea_42%,#f1eadf_100%)] text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]">
              US
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">UniServe</div>
              <div className="text-sm text-slate-500">Platform access</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-stone-300 hover:bg-white"
            >
              Back to site
            </Link>
            <LanguageSwitcher variant="light" />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.08fr_minmax(0,520px)] lg:gap-14">
          <section className="space-y-8">
            <div>
              <span className="inline-flex rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-700 shadow-[0_10px_25px_rgba(255,255,255,0.3)]">
                {badge}
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-white/75 bg-white/72 px-5 py-4 shadow-[0_22px_40px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <div className="text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[26px] border border-white/75 bg-white/68 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-slate-950">{highlight.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.description}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
