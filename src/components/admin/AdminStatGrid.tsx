"use client";

interface AdminStatItem {
  label: string;
  value: string | number;
  helper?: string;
}

export function AdminStatGrid({ items }: { items: AdminStatItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{item.value}</p>
          {item.helper ? <p className="mt-1 text-xs text-slate-400">{item.helper}</p> : null}
        </article>
      ))}
    </div>
  );
}
