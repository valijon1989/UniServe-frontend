type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onOpenFilters: () => void;
  sortLabels: { value: string; label: string }[];
  searchPlaceholder: string;
  filterLabel: string;
};

export function ServicesTopBar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  onOpenFilters,
  sortLabels,
  searchPlaceholder,
  filterLabel
}: Props) {
  return (
    <div className="sticky top-[72px] z-10 -mx-4 border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:border-none lg:bg-transparent lg:px-0 lg:py-0">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 lg:w-72"
        />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 lg:w-48"
        >
          {sortLabels.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onOpenFilters}
          className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-200 lg:w-auto"
        >
          {filterLabel}
        </button>
      </div>
    </div>
  );
}
