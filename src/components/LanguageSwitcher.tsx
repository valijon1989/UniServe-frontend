"use client";

import { languageOptions, useI18n, type Language } from "@/context/i18n";

export function LanguageSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { language, setLanguage } = useI18n();
  const className =
    variant === "light"
      ? "rounded-full border border-stone-200 bg-white/80 px-2 py-1 text-xs text-slate-700 outline-none hover:border-stone-300"
      : "rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-200 outline-none hover:border-sky-500";

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className={className}
    >
      {languageOptions.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
