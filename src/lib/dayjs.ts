import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import "dayjs/locale/ru";
import "dayjs/locale/uz-latn";

import type { SupportedLocale } from "./localization";

dayjs.extend(relativeTime);

const DAYJS_LOCALE_MAP: Record<SupportedLocale, string> = {
  en: "en",
  uz: "uz-latn",
  ru: "ru",
  ko: "ko"
};

export const setDayjsLocale = (locale: SupportedLocale = "uz") => {
  dayjs.locale(DAYJS_LOCALE_MAP[locale] || DAYJS_LOCALE_MAP.uz);
};

setDayjsLocale("uz");

export default dayjs;
