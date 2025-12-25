type Filters = {
  providerType: string;
  deliveryMode: string;
  minRating: string;
  priceMin: string;
  priceMax: string;
};

type Props = {
  open: boolean;
  variant: "drawer" | "sheet";
  filters: Filters;
  onChange: (next: Filters) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  labels: {
    title: string;
    providerType: string;
    deliveryMode: string;
    minRating: string;
    priceRange: string;
    apply: string;
    clear: string;
    close: string;
    any: string;
    all: string;
    providerSocial: string;
    providerMaterial: string;
    deliveryOnline: string;
    deliveryOffline: string;
    deliveryBoth: string;
    priceMin: string;
    priceMax: string;
  };
};

export function ServicesFilterPanel({
  open,
  variant,
  filters,
  onChange,
  onApply,
  onClear,
  onClose,
  labels
}: Props) {
  if (!open) return null;

  const baseClass =
    variant === "drawer"
      ? "fixed inset-y-0 right-0 w-full max-w-sm"
      : "fixed inset-x-0 bottom-0 w-full";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm">
      <div className={baseClass}>
        <div className="h-full rounded-t-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl lg:rounded-l-3xl lg:rounded-tr-none">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">{labels.title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
            >
              {labels.close}
            </button>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs text-slate-300">{labels.providerType}</label>
              <select
                value={filters.providerType}
                onChange={(e) => onChange({ ...filters, providerType: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">{labels.all}</option>
                <option value="social">{labels.providerSocial}</option>
                <option value="material">{labels.providerMaterial}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">{labels.deliveryMode}</label>
              <select
                value={filters.deliveryMode}
                onChange={(e) => onChange({ ...filters, deliveryMode: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">{labels.any}</option>
                <option value="online">{labels.deliveryOnline}</option>
                <option value="offline">{labels.deliveryOffline}</option>
                <option value="both">{labels.deliveryBoth}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">{labels.minRating}</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={filters.minRating}
                onChange={(e) => onChange({ ...filters, minRating: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                placeholder="4.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">{labels.priceRange}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={filters.priceMin}
                  onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  placeholder={labels.priceMin}
                />
                <input
                  type="number"
                  min={0}
                  value={filters.priceMax}
                  onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  placeholder={labels.priceMax}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={onClear}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
            >
              {labels.clear}
            </button>
            <button
              type="button"
              onClick={onApply}
              className="w-full rounded-xl bg-emerald-400/90 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              {labels.apply}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
