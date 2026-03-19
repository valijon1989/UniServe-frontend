"use client";

type ServiceHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rating: number;
  reviewCount: number;
  location?: string;
  postedDate?: string;
};

const renderStars = (rating: number) => {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => (index < filled ? "★" : "☆")).join("");
};

export function ServiceHeader({
  eyebrow,
  title,
  subtitle,
  rating,
  reviewCount,
  location,
  postedDate
}: ServiceHeaderProps) {
  return (
    <section className="space-y-4">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {subtitle ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        {reviewCount > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-800">
            <span className="text-base">{renderStars(rating)}</span>
            <span>{rating.toFixed(1)}</span>
            <span className="text-amber-600">({reviewCount})</span>
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
            Yangi e'lon
          </span>
        )}
        {location ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5">
            {location}
          </span>
        ) : null}
        {postedDate ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5">
            Joylangan: {postedDate}
          </span>
        ) : null}
      </div>
    </section>
  );
}
