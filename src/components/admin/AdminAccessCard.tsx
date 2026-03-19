import type { ReactNode } from "react";

export function AdminAccessCard({
  badge,
  title,
  subtitle,
  children,
  footer
}: {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-cyan-500/20 bg-[linear-gradient(180deg,rgba(2,8,23,0.94),rgba(2,6,23,0.9))] p-[1px] shadow-[0_34px_90px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.12),transparent_28%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 rounded-[29px] border border-white/6 bg-[linear-gradient(180deg,rgba(3,7,18,0.96),rgba(2,6,23,0.92))] p-5 sm:p-7">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
          {badge}
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">{title}</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </section>
  );
}
