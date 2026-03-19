"use client";

type ServicePriceProps = {
  priceLabel: string;
  pricingModel: string;
  supportingStats: Array<{ label: string; value: string }>;
};

export function ServicePrice({
  priceLabel,
  pricingModel,
  supportingStats
}: ServicePriceProps) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.94),rgba(224,242,254,0.92))] p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Price</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{priceLabel}</p>
          <p className="mt-2 text-sm text-slate-600">{pricingModel}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {supportingStats.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
