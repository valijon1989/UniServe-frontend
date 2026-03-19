"use client";

import type { CartItem } from "@/api/commerce";
import { getShopCategoryMeta } from "@/data/shopTaxonomy";
import { useI18n } from "@/context/i18n";
import { formatMoneyByLocale, resolveLocalizedText } from "@/lib/localization";

export function CartItemCard({
  item,
  pending,
  onIncrease,
  onDecrease,
  onRemove
}: {
  item: CartItem;
  pending?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const { t, language } = useI18n();
  const categoryLabel = item.category ? resolveLocalizedText(getShopCategoryMeta(item.category).label, language) : "";
  const kindLabel =
    item.kind === "service" ? t("cart.item.kind_service") : t("cart.item.kind_product");

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/92 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-28 w-full overflow-hidden rounded-[1.4rem] bg-slate-100 sm:w-28">
          <img
            src={item.thumbnail || "/placeholder.png"}
            alt={item.title}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder.png";
            }}
          />
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
            {kindLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              {categoryLabel ? <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">{categoryLabel}</p> : null}
              <h2 className="text-base font-black tracking-tight text-slate-950">{item.title}</h2>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {t("cart.item.unit_price")}{" "}
                  {formatMoneyByLocale(item.price, item.currency, language)}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {t({
                    en: `${item.qty} pcs`,
                    uz: `${item.qty} dona`,
                    ru: `${item.qty} шт.`,
                    ko: `${item.qty}개`
                  })}
                </span>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {t("cart.item.subtotal")}
              </p>
              <p className="mt-1 text-xl font-black text-slate-950">{formatMoneyByLocale(item.price * item.qty, item.currency, language)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                disabled={pending || item.qty <= 1}
                onClick={onDecrease}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                −
              </button>
              <span className="border-x border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900">{item.qty}</span>
              <button
                type="button"
                disabled={pending}
                onClick={onIncrease}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={pending}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >
                {t("cart.item.save_for_later")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={onRemove}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"
              >
                {t("cart.item.remove")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
