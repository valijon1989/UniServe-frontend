"use client";

export function PriceValueCard({
  eyebrow = "Value",
  price,
  period,
  description,
  bullets = [],
  accent = "emerald"
}: {
  eyebrow?: string;
  price: string;
  period?: string | null;
  description?: string | null;
  bullets?: string[];
  accent?: "emerald" | "sky" | "amber";
}) {
  const accentClasses = {
    emerald: "text-emerald-200 ring-emerald-400/20 bg-emerald-500/10",
    sky: "text-sky-100 ring-sky-400/20 bg-sky-500/10",
    amber: "text-amber-100 ring-amber-400/20 bg-amber-500/10"
  };

  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-5 shadow-lg shadow-black/15 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <p className="text-3xl font-black tracking-tight text-white">{price}</p>
        {period ? <p className="pb-1 text-sm text-slate-300">{period}</p> : null}
      </div>
      {description ? <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p> : null}
      {bullets.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {bullets.map((item) => (
            <div key={item} className={`rounded-2xl px-3.5 py-2.5 text-sm ring-1 ${accentClasses[accent]}`}>
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
