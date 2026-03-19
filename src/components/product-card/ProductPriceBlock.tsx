import { ProductBadge } from "@/components/product-card/ProductBadge";

interface ProductPriceBlockProps {
  label: string;
  currentPrice: string;
  oldPrice?: string | null;
  discountLabel?: string | null;
  installmentLabel?: string | null;
  supportingLabel?: string | null;
}

export function ProductPriceBlock({
  label,
  currentPrice,
  oldPrice,
  discountLabel,
  installmentLabel,
  supportingLabel
}: ProductPriceBlockProps) {
  return (
    <div className="rounded-[1.45rem] border border-slate-200/80 bg-slate-50/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <div className="mt-1 flex flex-wrap items-end gap-2">
            <span className="text-[1.85rem] font-black leading-none tracking-tight text-slate-950">{currentPrice}</span>
            {oldPrice ? <span className="text-sm text-slate-400 line-through">{oldPrice}</span> : null}
          </div>
        </div>
        {discountLabel ? <ProductBadge label={discountLabel} tone="discount" className="shrink-0" /> : null}
      </div>

      {installmentLabel || supportingLabel ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {installmentLabel ? (
            <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700">{installmentLabel}</span>
          ) : null}
          {supportingLabel ? <span className="text-slate-500">{supportingLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
