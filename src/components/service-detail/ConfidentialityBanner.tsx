"use client";

type ConfidentialityBannerProps = {
  title: string;
  description: string;
  points?: string[];
};

export function ConfidentialityBanner({
  title,
  description,
  points = []
}: ConfidentialityBannerProps) {
  return (
    <section className="rounded-[1.7rem] border border-emerald-500/25 bg-emerald-500/10 p-5 shadow-lg shadow-black/10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-200/90">Trust note</p>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-emerald-50/90">{description}</p>
      {points.length ? (
        <div className="mt-4 grid gap-2">
          {points.map((item) => (
            <p key={item} className="rounded-2xl border border-emerald-400/20 bg-slate-950/30 px-4 py-3 text-sm text-emerald-50/90">
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
