import type { ReactNode } from "react";

export function PublicAuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,245,238,0.92))] p-5 shadow-[0_32px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-7">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_32%)]"
        aria-hidden="true"
      />
      <div className="relative z-10">
        {eyebrow ? (
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </section>
  );
}
