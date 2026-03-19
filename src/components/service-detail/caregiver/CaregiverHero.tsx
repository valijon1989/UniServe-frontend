"use client";

type CaregiverHeroProps = {
  categoryLabel: string;
  title: string;
  subtitle?: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
};

const renderStars = (rating: number) => {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => (index < filled ? "★" : "☆")).join("");
};

export function CaregiverHero({
  categoryLabel,
  title,
  subtitle,
  rating,
  reviewCount,
  highlights
}: CaregiverHeroProps) {
  return (
    <section className="rounded-[2.1rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.94),rgba(236,253,245,0.94))] p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {categoryLabel}
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
          {renderStars(rating)} {rating.toFixed(1)} ({reviewCount})
        </span>
      </div>

      <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{subtitle}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {highlights.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm text-slate-700 shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
