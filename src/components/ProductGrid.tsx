"use client";

import type { ReactNode } from "react";

export function ProductGrid({
  children,
  empty,
  footer,
  className = "",
  gridClassName = ""
}: {
  children: ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
  className?: string;
  gridClassName?: string;
}) {
  return (
    <div
      className={`rounded-[1.9rem] border border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-[0_24px_50px_rgba(15,23,42,0.07)] sm:p-5 ${className}`.trim()}
    >
      <div className={`grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${gridClassName}`.trim()}>
        {children}
      </div>
      {empty}
      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
