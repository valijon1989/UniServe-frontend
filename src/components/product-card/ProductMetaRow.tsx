import type { ReactNode } from "react";

export type ProductMetaTone = "neutral" | "muted" | "success" | "warning" | "info" | "danger";

const toneClasses: Record<ProductMetaTone, string> = {
  neutral: "border-slate-200/80 bg-white text-slate-700",
  muted: "border-slate-200/70 bg-slate-50 text-slate-600",
  success: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200/80 bg-amber-50 text-amber-800",
  info: "border-sky-200/80 bg-sky-50 text-sky-700",
  danger: "border-rose-200/80 bg-rose-50 text-rose-700"
};

export interface ProductMetaItem {
  key: string;
  label: string;
  icon?: ReactNode;
  tone?: ProductMetaTone;
}

export function ProductMetaRow({
  items,
  className = ""
}: {
  items: ProductMetaItem[];
  className?: string;
}) {
  const visibleItems = items.filter((item) => item.label);

  if (visibleItems.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {visibleItems.map((item) => (
        <span
          key={item.key}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${toneClasses[item.tone || "neutral"]}`}
        >
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <span className="truncate">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
