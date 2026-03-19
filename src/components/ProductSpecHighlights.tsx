"use client";

export interface ProductSpecHighlight {
  label: string;
  value: string;
}

export function ProductSpecHighlights({
  title,
  description,
  items
}: {
  title: string;
  description?: string;
  items: ProductSpecHighlight[];
}) {
  if (!items.length) return null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
      <div className="mb-4">
        <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="rounded-[1.4rem] border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

