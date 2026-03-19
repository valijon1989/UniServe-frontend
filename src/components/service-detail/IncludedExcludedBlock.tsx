"use client";

type IncludedExcludedBlockProps = {
  title: string;
  included: string[];
  excluded: string[];
  includedLabel?: string;
  excludedLabel?: string;
};

export function IncludedExcludedBlock({
  title,
  included,
  excluded,
  includedLabel = "Nima kiradi",
  excludedLabel = "Nima kirmaydi"
}: IncludedExcludedBlockProps) {
  return (
    <section className="rounded-[1.7rem] border border-slate-800 bg-slate-950/72 p-5 shadow-lg shadow-black/20">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Scope</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-100">{title}</h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-100">{includedLabel}</p>
          <div className="mt-3 grid gap-2 text-sm text-emerald-50/90">
            {included.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-100">{excludedLabel}</p>
          <div className="mt-3 grid gap-2 text-sm text-rose-50/90">
            {excluded.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
