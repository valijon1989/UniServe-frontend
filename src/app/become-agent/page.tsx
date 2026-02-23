"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/context/i18n";

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  experience: string;
  languages: string;
  bio: string;
  portfolioUrl: string;
  documents: FileList | null;
  idConfirmed: boolean;
  rulesAccepted: boolean;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  location: "",
  category: "",
  experience: "",
  languages: "",
  bio: "",
  portfolioUrl: "",
  documents: null,
  idConfirmed: false,
  rulesAccepted: false
};

const stepMeta = [
  { key: "basic", labelKey: "become.form.step.basic", descKey: "become.form.step.basicDesc" },
  { key: "professional", labelKey: "become.form.step.professional", descKey: "become.form.step.professionalDesc" },
  { key: "proof", labelKey: "become.form.step.proof", descKey: "become.form.step.proofDesc" },
  { key: "confirm", labelKey: "become.form.step.confirm", descKey: "become.form.step.confirmDesc" }
] as const;

export default function BecomeAgentPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useI18n();

  const progress = useMemo(() => ((stepIndex + 1) / stepMeta.length) * 100, [stepIndex]);

  const benefits = useMemo(
    () => [
      { title: t("become.benefits.income.title"), desc: t("become.benefits.income.desc") },
      { title: t("become.benefits.secure.title"), desc: t("become.benefits.secure.desc") },
      { title: t("become.benefits.reputation.title"), desc: t("become.benefits.reputation.desc") },
      { title: t("become.benefits.flexible.title"), desc: t("become.benefits.flexible.desc") },
      { title: t("become.benefits.verified.title"), desc: t("become.benefits.verified.desc") }
    ],
    [t]
  );

  const acceptedCategories = useMemo(
    () => [
      { title: t("become.accepted.consulting.title"), desc: t("become.accepted.consulting.desc") },
      { title: t("become.accepted.translation.title"), desc: t("become.accepted.translation.desc") },
      { title: t("become.accepted.legal.title"), desc: t("become.accepted.legal.desc") },
      { title: t("become.accepted.psychology.title"), desc: t("become.accepted.psychology.desc") },
      { title: t("become.accepted.sports.title"), desc: t("become.accepted.sports.desc") },
      { title: t("become.accepted.other.title"), desc: t("become.accepted.other.desc") }
    ],
    [t]
  );

  const requirements = useMemo(
    () => [
      t("become.requirements.item1"),
      t("become.requirements.item2"),
      t("become.requirements.item3"),
      t("become.requirements.item4"),
      t("become.requirements.item5")
    ],
    [t]
  );

  const howSteps = useMemo(
    () => [
      { title: t("become.how.step.apply.title"), desc: t("become.how.step.apply.desc") },
      { title: t("become.how.step.verify.title"), desc: t("become.how.step.verify.desc") },
      { title: t("become.how.step.profile.title"), desc: t("become.how.step.profile.desc") },
      { title: t("become.how.step.earn.title"), desc: t("become.how.step.earn.desc") }
    ],
    [t]
  );

  const commissionHighlights = useMemo(
    () => [
      { label: t("become.commission.rateLabel"), value: t("become.commission.rateValue") },
      { label: t("become.commission.payoutLabel"), value: t("become.commission.payoutDesc") },
      { label: t("become.commission.methodsLabel"), value: t("become.commission.methods") }
    ],
    [t]
  );

  const trustHighlights = useMemo(
    () => [
      { title: t("become.trust.data.title"), desc: t("become.trust.data.desc") },
      { title: t("become.trust.noSpam.title"), desc: t("become.trust.noSpam.desc") }
    ],
    [t]
  );

  const faqs = useMemo(
    () => [
      { q: t("become.faq.q1"), a: t("become.faq.a1") },
      { q: t("become.faq.q2"), a: t("become.faq.a2") },
      { q: t("become.faq.q3"), a: t("become.faq.a3") },
      { q: t("become.faq.q4"), a: t("become.faq.a4") },
      { q: t("become.faq.q5"), a: t("become.faq.a5") },
      { q: t("become.faq.q6"), a: t("become.faq.a6") }
    ],
    [t]
  );

  const isStepValid = useMemo(() => {
    if (stepIndex === 0) {
      return Boolean(form.name && form.email && form.phone && form.location);
    }
    if (stepIndex === 1) {
      return Boolean(form.category && form.experience && form.languages && form.bio);
    }
    if (stepIndex === 2) {
      return Boolean(form.idConfirmed);
    }
    if (stepIndex === 3) {
      return Boolean(form.rulesAccepted);
    }
    return false;
  }, [form, stepIndex]);

  const handleNext = () => {
    if (!isStepValid) return;
    setStepIndex((prev) => Math.min(prev + 1, stepMeta.length - 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!isStepValid) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setSubmitted(true);
  };

  const summaryFields = [
    { label: t("become.form.summary.name"), value: form.name || "-" },
    { label: t("become.form.summary.email"), value: form.email || "-" },
    { label: t("become.form.summary.phone"), value: form.phone || "-" },
    { label: t("become.form.summary.location"), value: form.location || "-" },
    { label: t("become.form.summary.category"), value: form.category || "-" },
    { label: t("become.form.summary.experience"), value: form.experience || "-" },
    { label: t("become.form.summary.languages"), value: form.languages || "-" },
    { label: t("become.form.summary.portfolio"), value: form.portfolioUrl || "-" },
    {
      label: t("become.form.summary.documents"),
      value: form.documents ? `${form.documents.length} ${t("become.form.summary.documentsCount")}` : t("become.form.summary.none")
    }
  ];

  const stepFields = () => {
    if (stepMeta[stepIndex].key === "basic") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.name")}</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
              placeholder={t("become.form.name")}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.email")}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
              placeholder={t("become.form.email")}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.phone.label")}</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
              placeholder={t("become.form.phone.placeholder")}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.location.label")}</span>
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
              placeholder={t("become.form.location.placeholder")}
            />
          </label>
        </div>
      );
    }

    if (stepMeta[stepIndex].key === "professional") {
      return (
        <div className="space-y-4">
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.category.label")}</span>
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
            >
              <option value="">{t("become.form.category.placeholder")}</option>
              {acceptedCategories.map((category) => (
                <option key={category.title} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              <span>{t("become.form.experience.label")}</span>
              <input
                type="number"
                min={0}
                value={form.experience}
                onChange={(event) => setForm((prev) => ({ ...prev, experience: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
                placeholder={t("become.form.experience.placeholder")}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              <span>{t("become.form.languages.label")}</span>
              <input
                type="text"
                value={form.languages}
                onChange={(event) => setForm((prev) => ({ ...prev, languages: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
                placeholder={t("become.form.languages.placeholder")}
              />
            </label>
          </div>
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.bio.label")}</span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              className="h-28 w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
              placeholder={t("become.form.bio.placeholder")}
            />
          </label>
        </div>
      );
    }

    if (stepMeta[stepIndex].key === "proof") {
      return (
        <div className="space-y-4">
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.portfolio.label")}</span>
            <input
              type="url"
              value={form.portfolioUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, portfolioUrl: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-sm"
              placeholder={t("become.form.portfolio.placeholder")}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>{t("become.form.documents.label")}</span>
            <input
              type="file"
              multiple
              onChange={(event) => setForm((prev) => ({ ...prev, documents: event.target.files }))}
              className="w-full text-xs text-slate-600 file:mr-2 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-white"
            />
            {form.documents && (
              <p className="text-xs text-slate-400">
                {form.documents.length} {t("become.form.documentsCount")}
              </p>
            )}
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.idConfirmed}
              onChange={(event) => setForm((prev) => ({ ...prev, idConfirmed: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-500"
            />
            <span>{t("become.form.idConfirm")}</span>
          </label>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-900">{t("become.form.summary.title")}</p>
        <div className="grid gap-2 md:grid-cols-2">
          {summaryFields.map((field) => (
            <div key={field.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">{field.label}</p>
              <p className="text-sm text-slate-900">{field.value}</p>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.rulesAccepted}
            onChange={(event) => setForm((prev) => ({ ...prev, rulesAccepted: event.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-emerald-500"
          />
          <span>{t("become.form.rules.accept")}</span>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-slate-50 shadow-2xl">
        <div className="absolute inset-0 opacity-70">
          <div className="h-full w-full bg-[url('/images/agent-hero.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900" />
        </div>
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{t("become.hero.kicker")}</p>
            <h1 className="text-4xl font-semibold leading-tight">{t("become.hero.title")}</h1>
            <p className="max-w-2xl text-sm text-slate-200">{t("become.hero.subtitle")}</p>
            <div className="flex flex-wrap gap-3 text-xs text-emerald-100/90">
              <span className="rounded-full bg-white/10 px-3 py-1">{t("become.hero.tag.income")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{t("become.hero.tag.flexible")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{t("become.hero.tag.verified")}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/60"
              >
                {t("become.hero.cta.primary")}
              </button>
              <Link
                href="#how-it-works"
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/60"
              >
                {t("become.hero.cta.secondary")}
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800 p-4">
            <div className="aspect-[4/3] w-full rounded-xl bg-[url('/images/agent-overlay.jpg')] bg-cover bg-center" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{t("become.hero.reviewLabel")}</p>
                <p className="mt-2 text-lg font-semibold">{t("become.hero.reviewValue")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{t("become.hero.commissionLabel")}</p>
                <p className="mt-2 text-lg font-semibold">{t("become.hero.commissionValue")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{benefit.title}</p>
            <p className="mt-2 text-sm text-slate-500">{benefit.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("become.accepted.kicker")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t("become.accepted.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("become.accepted.subtitle")}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {acceptedCategories.map((item) => (
            <div key={item.title} className="group rounded-xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("become.requirements.kicker")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t("become.requirements.title")}</h2>
          <div className="mt-4 grid gap-3">
            {requirements.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">{t("become.trust.kicker")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-emerald-900">{t("become.trust.title")}</h2>
          <p className="mt-2 text-sm text-emerald-800">{t("become.trust.subtitle")}</p>
          <div className="mt-4 space-y-3">
            {trustHighlights.map((highlight) => (
              <div key={highlight.title} className="space-y-1 rounded-2xl bg-white/60 p-4 text-sm text-emerald-900 shadow-sm">
                <p className="font-semibold">{highlight.title}</p>
                <p className="text-xs text-emerald-700">{highlight.desc}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="how-it-works" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("become.how.kicker")}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t("become.how.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("become.how.subtitle")}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{t("become.how.review")}</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {howSteps.map((step, index) => (
            <div key={step.title} className="space-y-2 rounded-2xl border border-slate-100 p-4 shadow-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{index + 1}</span>
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="text-xs text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("become.commission.kicker")}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t("become.commission.title")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("become.commission.desc")}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {t("become.commission.rateValue")}
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {commissionHighlights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="apply" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!submitted ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("become.form.title")}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t("become.form.subtitle")}</h2>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-500">{t(stepMeta[stepIndex].descKey)}</span>
                <p className="text-sm font-semibold text-slate-900">{t(stepMeta[stepIndex].labelKey)}</p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-6 space-y-4">{stepFields()}</div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {stepMeta.map((step, index) => (
                  <span
                    key={step.key}
                    className={`rounded-full px-3 py-1 ${index === stepIndex ? "bg-emerald-500/20 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {t(step.labelKey)}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={stepIndex === 0}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("become.form.back")}
                </button>
                {stepIndex < stepMeta.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("become.form.continue")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isStepValid || submitting}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? t("become.form.submitting") : t("become.form.submit")}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">{t("become.success.kicker")}</p>
            <h2 className="text-2xl font-semibold text-emerald-900">{t("become.success.title")}</h2>
            <p className="text-sm text-emerald-800">{t("become.success.desc")}</p>
            <p className="text-xs text-emerald-700">{t("become.success.email")}</p>
            <Link
              href="/agent/dashboard"
              className="inline-flex rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              {t("become.success.cta")}
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("become.faq.kicker")}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t("become.faq.title")}</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-900">{item.q}</p>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
