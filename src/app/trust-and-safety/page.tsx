"use client";

import Link from "next/link";
import { useI18n } from "@/context/i18n";

export default function TrustAndSafetyPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("home.trust.kicker")}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t("trust.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {t("trust.subtitle")}
        </p>
      </section>

      <section id="payments" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("trust.payments.title")}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t("trust.payments.desc")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Escrowed</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Released</span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Refunded</span>
        </div>
        <Link
          href="/my-orders"
          className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          {t("trust.payments.cta")}
        </Link>
      </section>
    </div>
  );
}
