"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "@/components/cart/CartIconButton";
import { getShopCategoryMeta } from "@/data/shopTaxonomy";
import { useI18n } from "@/context/i18n";
import { resolveLocalizedText } from "@/lib/localization";

export function CartEmptyState() {
  const { t, language } = useI18n();
  const shortcuts = ["electronics", "food", "fashion", "home-appliances"].map((slug) =>
    resolveLocalizedText(getShopCategoryMeta(slug).shortLabel, language)
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/92 p-10 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_46%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.14),_transparent_42%)]" />
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-slate-950 text-sky-300 shadow-lg shadow-slate-950/20">
          <ShoppingBagIcon className="h-8 w-8" />
        </div>
        <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{t("cart.empty.title")}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {t("cart.empty.subtitle")}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {shortcuts.map((shortcut) => (
            <span key={shortcut} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {shortcut}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            {t("cart.empty.browse_products")}
          </Link>
          <Link
            href="/agents?view=services"
            className="inline-flex min-w-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            {t("cart.empty.browse_services")}
          </Link>
        </div>
      </div>
    </section>
  );
}
