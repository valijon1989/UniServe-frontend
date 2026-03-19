"use client";

export interface ProductSummaryChip {
  label: string;
}

export function ProductSummary({
  breadcrumb,
  title,
  subtitle,
  rating,
  reviewCount,
  category,
  chips
}: {
  breadcrumb: string[];
  title: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  category?: string;
  chips: ProductSummaryChip[];
}) {
  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {breadcrumb.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-slate-300">/</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          {category ? <p className="text-sm font-semibold text-emerald-600">{category}</p> : null}
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-right shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-700">Buyer signal</p>
          <p className="mt-1 text-2xl font-black text-amber-900">★ {rating.toFixed(1)}</p>
          <p className="text-xs text-amber-700">{reviewCount} review</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip.label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {chip.label}
          </span>
        ))}
      </div>
    </section>
  );
}

