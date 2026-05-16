// Hreflang helpers — Faz 4.1 real /locale/* URLs for 9 supported languages.

import { SITE_URL } from "@/lib/schema";

const HREFLANG_LOCALES: { locale: string; tag: string }[] = [
  { locale: "tr", tag: "tr-TR" },
  { locale: "en", tag: "en" },
  { locale: "de", tag: "de" },
  { locale: "fr", tag: "fr" },
  { locale: "es", tag: "es" },
  { locale: "nl", tag: "nl" },
  { locale: "zh", tag: "zh-Hans" },
  { locale: "hi", tag: "hi" },
  { locale: "ur", tag: "ur" },
];

/**
 * Build hreflang `alternates.languages` map for a given path.
 * Returns real `/tr/path`, `/en/path`, etc URLs for all 9 locales.
 * x-default points to /tr (default locale).
 */
export function generateHreflang(
  path: string
): Record<string, string> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const result: Record<string, string> = {};
  for (const { locale, tag } of HREFLANG_LOCALES) {
    result[tag] = `${SITE_URL}/${locale}${normalized === "/" ? "" : normalized}`;
  }
  result["x-default"] = `${SITE_URL}/tr${normalized === "/" ? "" : normalized}`;
  return result;
}

/**
 * Build dynamic OG image URL for `/api/og` endpoint.
 */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `/api/og?${params.toString()}`;
}
