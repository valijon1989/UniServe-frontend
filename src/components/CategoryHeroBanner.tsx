"use client";

export interface HeroCategoryPill {
  key: string;
  label: string;
  icon?: string;
  hint?: string;
}

export interface HeroCollectionStat {
  label: string;
  value: string;
  caption: string;
}

export interface HeroTrustReason {
  label: string;
  description: string;
}

export function CategoryHeroBanner({
  eyebrow,
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  searchTags,
  onSelectTag,
  categories,
  activeCategory,
  onSelectCategory,
  fastOnly,
  onToggleFastOnly,
  collectionStats,
  trustReasons,
  topBrands,
  accentClassName
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchTags: string[];
  onSelectTag: (value: string) => void;
  categories: HeroCategoryPill[];
  activeCategory: string;
  onSelectCategory: (value: string) => void;
  fastOnly: boolean;
  onToggleFastOnly: () => void;
  collectionStats: HeroCollectionStat[];
  trustReasons: HeroTrustReason[];
  topBrands: string[];
  accentClassName?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br ${accentClassName || "from-slate-950 via-slate-900 to-emerald-700"} p-6 text-white shadow-[0_32px_80px_rgba(15,23,42,0.24)]`}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{eyebrow}</p>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">{subtitle}</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-3 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-14 flex-1 rounded-2xl border border-white/15 bg-white/95 px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={onToggleFastOnly}
                className={`h-14 rounded-2xl px-5 text-sm font-semibold transition ${
                  fastOnly ? "bg-emerald-400 text-slate-950" : "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {fastOnly ? "Tez yetkazish yoqilgan" : "Tez yetkazishni ko'rsat"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {searchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(tag)}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/20"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((category) => {
              const active = activeCategory === category.key;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => onSelectCategory(category.key)}
                  className={`min-w-[168px] rounded-[1.35rem] border px-4 py-3 text-left transition ${
                    active ? "border-white/30 bg-white text-slate-950 shadow-lg" : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-lg">{category.icon || "•"}</span>
                    <span>{category.label}</span>
                  </div>
                  {category.hint ? (
                    <p className={`mt-1 text-xs ${active ? "text-slate-600" : "text-white/65"}`}>{category.hint}</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Marketplace reasons</p>
            <div className="mt-4 space-y-3">
              {trustReasons.map((reason) => (
                <div key={reason.label} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">{reason.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur sm:col-span-2 xl:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Featured collections</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {collectionStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-white/65">{item.caption}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Top brands</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {topBrands.map((brand) => (
                  <span key={brand} className="rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-xs font-medium text-white/90">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

