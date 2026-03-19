import type { MouseEventHandler, ReactNode } from "react";

interface ProductActionsProps {
  addToCartLabel: string;
  buyNowLabel: string;
  loadingCartLabel?: string;
  loadingBuyLabel?: string;
  onAddToCart: MouseEventHandler<HTMLButtonElement>;
  onBuyNow: MouseEventHandler<HTMLButtonElement>;
  pendingAction?: "cart" | "buy" | null;
  disabled?: boolean;
  extraAction?: ReactNode;
}

export function ProductActions({
  addToCartLabel,
  buyNowLabel,
  loadingCartLabel,
  loadingBuyLabel,
  onAddToCart,
  onBuyNow,
  pendingAction = null,
  disabled = false,
  extraAction
}: ProductActionsProps) {
  const isCartBusy = disabled || pendingAction === "cart";
  const isBuyBusy = disabled || pendingAction === "buy";

  return (
    <div className="pointer-events-auto mt-auto flex items-center gap-2">
      <button
        type="button"
        onClick={onAddToCart}
        disabled={isCartBusy}
        className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-slate-950 px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pendingAction === "cart" ? loadingCartLabel || addToCartLabel : addToCartLabel}
      </button>
      <button
        type="button"
        onClick={onBuyNow}
        disabled={isBuyBusy}
        className="flex h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 text-[13px] font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {pendingAction === "buy" ? loadingBuyLabel || buyNowLabel : buyNowLabel}
      </button>
      {extraAction ? <div className="shrink-0">{extraAction}</div> : null}
    </div>
  );
}
