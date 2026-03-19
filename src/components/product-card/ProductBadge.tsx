import type { ReactNode } from "react";

export type ProductBadgeTone =
  | "neutral"
  | "dark"
  | "discount"
  | "success"
  | "warning"
  | "info"
  | "danger";

const toneClasses: Record<ProductBadgeTone, string> = {
  neutral: "border-slate-200/80 bg-white/92 text-slate-700",
  dark: "border-slate-900/80 bg-slate-950/92 text-white",
  discount: "border-rose-500/70 bg-rose-500/92 text-white",
  success: "border-emerald-200/80 bg-emerald-50/95 text-emerald-700",
  warning: "border-amber-200/80 bg-amber-50/95 text-amber-800",
  info: "border-sky-200/80 bg-sky-50/95 text-sky-700",
  danger: "border-rose-200/80 bg-rose-50/95 text-rose-700"
};

interface ProductBadgeProps {
  label: string;
  tone?: ProductBadgeTone;
  icon?: ReactNode;
  className?: string;
}

export function ProductBadge({ label, tone = "neutral", icon, className = "" }: ProductBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur ${toneClasses[tone]} ${className}`.trim()}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}
