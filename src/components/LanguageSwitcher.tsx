"use client";

import { languageOptions, useI18n, type Language } from "@/context/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-200 outline-none hover:border-sky-500"
    >
      {languageOptions.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
