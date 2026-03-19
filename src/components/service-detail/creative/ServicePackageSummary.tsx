"use client";

type ServicePackageSummaryProps = {
  packageLabel?: string;
  priceLabel: string;
  unitLabel?: string;
  deliveryTime: string;
  revisions: string;
  included: string[];
};

export function ServicePackageSummary({
  packageLabel = "Creative package",
  priceLabel,
  unitLabel,
  deliveryTime,
  revisions,
  included
}: ServicePackageSummaryProps) {
  return (
    <section className="rounded-[1.9rem] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,0.98),rgba(240,249,255,0.92))] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">{packageLabel}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{priceLabel}</p>
          {unitLabel ? <p className="mt-1 text-sm text-slate-600">{unitLabel}</p> : null}
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
          Conversion-focused
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/75 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Delivery</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{deliveryTime}</p>
        </div>
        <div className="rounded-2xl bg-white/75 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Revisions</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{revisions}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">What is included</p>
        <div className="mt-3 space-y-2">
          {included.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm text-slate-700">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
