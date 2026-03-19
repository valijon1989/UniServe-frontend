"use client";

import type { DetailReview } from "@/components/service-detail/types";

type ServiceReviewsProps = {
  rating: number;
  reviewCount: number;
  reviews: DetailReview[];
};

const renderStars = (rating: number) => {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => (index < filled ? "★" : "☆")).join("");
};

const buildBreakdown = (rating: number) => {
  const normalized = Math.max(1, Math.min(5, rating));
  const five = Math.min(86, Math.max(42, Math.round(normalized * 14)));
  const four = Math.max(8, 70 - five);
  const three = Math.max(4, 18 - Math.round((normalized - 4) * 4));
  const two = Math.max(2, 8 - Math.round((normalized - 4) * 2));
  const one = Math.max(1, 100 - five - four - three - two);
  return [
    { label: "5", value: five },
    { label: "4", value: four },
    { label: "3", value: three },
    { label: "2", value: two },
    { label: "1", value: one }
  ];
};

export function ServiceReviews({ rating, reviewCount, reviews }: ServiceReviewsProps) {
  const breakdown = buildBreakdown(rating);
  const hasReviewSummary = reviewCount > 0 && rating > 0;
  const featuredReviews = reviews.slice(0, 3);
  const remainingCount = Math.max(0, reviews.length - featuredReviews.length);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/15 backdrop-blur">
      <div className="grid gap-6 xl:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/80">Reviews</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Mijozlar fikri</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Reyting, featured sharhlar va buyer trust signallari shu blokda jamlangan.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5">
            {hasReviewSummary ? (
              <>
                <p className="text-4xl font-black text-white">{rating.toFixed(1)}</p>
                <p className="mt-2 text-lg text-amber-300">{renderStars(rating)}</p>
                <p className="mt-2 text-sm text-slate-400">{reviewCount} ta baho asosida</p>

                <div className="mt-5 space-y-2">
                  {breakdown.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-semibold text-slate-400">{item.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-amber-300" style={{ width: `${item.value}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-slate-400">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-white/15 bg-slate-900/80 px-4 py-5 text-sm text-slate-400">
                Bu xizmat uchun hali public review yo'q. Buyurtmadan keyingi feedback shu yerda ko'rinadi.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {featuredReviews.length > 0 ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {featuredReviews.map((review) => (
                  <article key={review.id} className="flex h-full flex-col rounded-[1.55rem] border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{review.author}</p>
                        {review.role ? <p className="text-xs text-slate-400">{review.role}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-amber-300">{renderStars(review.rating)}</p>
                        <p className="text-xs text-slate-500">{review.dateLabel}</p>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{review.text}</p>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-sm text-slate-300">
                  {remainingCount > 0
                    ? `${remainingCount} ta qo'shimcha sharh mavjud.`
                    : "Hozircha featured reviewlar ko'rsatildi."}
                </p>
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  Ko'proq ko'rish
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/35 px-4 py-6 text-sm text-slate-400">
              Hozircha ko'rinadigan izohlar yo'q. Yangi mijoz feedbacklari shu yerda chiqadi.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
