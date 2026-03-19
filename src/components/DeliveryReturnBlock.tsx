"use client";

export function DeliveryReturnBlock({
  items
}: {
  items: Array<{ label: string; value: string; note?: string }>;
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Delivery / return</p>
        <p className="mt-1 text-lg font-black tracking-tight text-slate-950">Yetkazish va himoya</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
            {item.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

