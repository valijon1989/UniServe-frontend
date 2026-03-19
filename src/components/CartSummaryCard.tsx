"use client";

import { useI18n } from "@/context/i18n";
import { formatMoneyByLocale } from "@/lib/localization";

export function CartSummaryCard({
  totalItems,
  productCount,
  serviceCount,
  subtotal,
  shipping,
  total,
  currency,
  onCheckout,
  onClear
}: {
  totalItems: number;
  productCount: number;
  serviceCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  onCheckout: () => void;
  onClear: () => void;
}) {
  const { t, language } = useI18n();

  return (
    <aside className="h-fit space-y-4 xl:sticky xl:top-24">
      <section className="rounded-[1.9rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_60px_rgba(15,23,42,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">{t("cart.summary.checkout_prep")}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">{t("cart.summary.title")}</h2>
        <div className="mt-5 space-y-3 text-sm text-white/75">
          <div className="flex items-center justify-between">
            <span>{t("cart.summary.items")}</span>
            <span className="font-semibold text-white">{totalItems}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("cart.summary.product_service_count")}</span>
            <span className="font-semibold text-white">
              {productCount} / {serviceCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("cart.summary.subtotal")}</span>
            <span className="font-semibold text-white">{formatMoneyByLocale(subtotal, currency, language)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("cart.summary.delivery")}</span>
            <span className="font-semibold text-white">
              {shipping === 0 ? t("cart.summary.free_delivery") : formatMoneyByLocale(shipping, currency, language)}
            </span>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between text-base font-black text-white">
              <span>{t("cart.summary.total")}</span>
              <span>{formatMoneyByLocale(total, currency, language)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="mt-5 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300"
        >
          {t("cart.summary.cta")}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {t("cart.summary.clear")}
        </button>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("cart.summary.next_steps")}</p>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          <p>{t("cart.summary.step_1")}</p>
          <p>{t("cart.summary.step_2")}</p>
          <p>{t("cart.summary.step_3")}</p>
        </div>
      </section>
    </aside>
  );
}
