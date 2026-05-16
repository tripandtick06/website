// next-intl request config. Server-side messages loader.
// Reads from src/lib/i18n/dictionaries.ts (single source of truth for all 9 locales).

import { getRequestConfig } from "next-intl/server";
import { DICTIONARIES, DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/dictionaries";

export const locales: Locale[] = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"];
export const defaultLocale: Locale = DEFAULT_LOCALE;

export default getRequestConfig(async ({ requestLocale }) => {
  let resolved = await requestLocale;
  if (!isLocale(resolved)) resolved = defaultLocale;
  return {
    locale: resolved as string,
    messages: DICTIONARIES[resolved as Locale] as never,
  };
});
