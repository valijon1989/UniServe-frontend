export function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[1.85rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_44px_rgba(15,23,42,0.08)]">
      <div className="animate-pulse">
        <div className="aspect-[4/5] w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200" />

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-slate-200" />
            <div className="h-5 w-4/5 rounded-full bg-slate-200" />
            <div className="h-5 w-3/5 rounded-full bg-slate-100" />
            <div className="h-3 w-full rounded-full bg-slate-100" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="h-7 w-20 rounded-full bg-slate-100" />
            <div className="h-7 w-24 rounded-full bg-slate-100" />
            <div className="h-7 w-16 rounded-full bg-slate-100" />
          </div>

          <div className="rounded-[1.45rem] border border-slate-200/70 bg-slate-50 p-4">
            <div className="h-3 w-16 rounded-full bg-slate-200" />
            <div className="mt-2 h-8 w-28 rounded-full bg-slate-200" />
            <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
          </div>

          <div className="flex gap-2">
            <div className="h-11 flex-1 rounded-2xl bg-slate-200" />
            <div className="h-11 w-28 rounded-2xl bg-slate-100" />
            <div className="h-11 w-11 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </article>
  );
}
