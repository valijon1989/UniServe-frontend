export type SupportedLocale = "en" | "uz" | "ru" | "ko";

export type LocalizedText = Partial<Record<SupportedLocale, string>>;

export const LANGUAGE_STORAGE_KEY = "uniserve_language";
export const DEFAULT_LOCALE: SupportedLocale = "uz";
export const FALLBACK_LOCALE: SupportedLocale = "en";

const LOCALE_FORMAT_MAP: Record<SupportedLocale, string> = {
  en: "en-US",
  uz: "uz-UZ",
  ru: "ru-RU",
  ko: "ko-KR"
};

const LOCALE_VALUES: SupportedLocale[] = ["en", "uz", "ru", "ko"];

export const tx = (en: string, uz: string, ru: string, ko: string): LocalizedText => ({
  en,
  uz,
  ru,
  ko
});

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  typeof value === "string" && LOCALE_VALUES.includes(value as SupportedLocale);

export const isLocalizedText = (value: unknown): value is LocalizedText => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return LOCALE_VALUES.some((locale) => typeof (value as LocalizedText)[locale] === "string");
};

export const readStoredLanguage = (): SupportedLocale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLocale(stored) ? stored : DEFAULT_LOCALE;
};

export const resolveLocalizedText = (
  value: string | LocalizedText | null | undefined,
  locale: SupportedLocale = DEFAULT_LOCALE,
  fallbackLocale: SupportedLocale = DEFAULT_LOCALE
): string => {
  if (typeof value === "string") return value;
  if (!value) return "";
  return (
    value[locale] ||
    value[fallbackLocale] ||
    value[FALLBACK_LOCALE] ||
    value[DEFAULT_LOCALE] ||
    value.ru ||
    value.ko ||
    ""
  );
};

export const formatMoneyByLocale = (
  value: number,
  currency = "USD",
  locale: SupportedLocale = DEFAULT_LOCALE
) =>
  new Intl.NumberFormat(LOCALE_FORMAT_MAP[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
