import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type SecurityItem = {
  title: string;
  description: string;
};

export function AdminAccessShell({
  badge,
  title,
  description,
  securityItems,
  children
}: {
  badge: string;
  title: string;
  description: string;
  securityItems: SecurityItem[];
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#020b16_42%,#01040b_100%)] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_85%_12%,rgba(8,145,178,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.9),transparent_40%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-slate-950/80 text-sm font-semibold text-cyan-100 shadow-[0_16px_34px_rgba(0,0,0,0.45)]">
              US
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200">Admin Access</div>
              <div className="text-sm text-slate-500">Authorized personnel only</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/8 hover:text-white"
            >
              Back to main site
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[0.95fr_minmax(0,520px)] lg:gap-16">
          <section className="space-y-8">
            <div>
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-200">
                {badge}
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">{description}</p>
            </div>

            <div className="grid gap-4">
              {securityItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[26px] border border-white/8 bg-white/[0.04] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)] backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="rounded-[24px] border border-amber-400/16 bg-amber-400/[0.05] px-5 py-4 text-sm leading-6 text-slate-300">
              All privileged sign-ins, approval flows, and override actions may be recorded in audit logs.
            </div>
          </section>

          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
