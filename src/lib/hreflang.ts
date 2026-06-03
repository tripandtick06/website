// Hreflang helpers — Faz 4.1 real /locale/* URLs for 9 supported languages.
// Faz 4.2: localized slug çevirisi — her locale kendi route segment'ini alır
// (routing.pathnames map), dynamic detay slug'ı korunur.

import { SITE_URL } from "@/lib/schema";
import { routing } from "@/i18n/routing";

const DEFAULT_LOCALE = routing.defaultLocale; // "tr"

// Build a lookup: TR first-segment ("/balonlar") -> per-locale segment map.
// Only object-valued pathnames are translated; string pathnames (e.g. "/blog")
// stay shared across locales.
const SEGMENT_MAP: Record<string, Record<string, string>> = (() => {
  const out: Record<string, Record<string, string>> = {};
  for (const value of Object.values(routing.pathnames)) {
    if (typeof value !== "object") continue;
    const trPath = value[DEFAULT_LOCALE];
    if (!trPath || trPath.includes("[")) continue; // skip dynamic templates
    out[trPath] = value as Record<string, string>;
  }
  return out;
})();

/**
 * Localize a TR-canonical path for a given locale.
 * Translates the first segment if it maps to a localized route; preserves the
 * remaining segments (dynamic slug/id). Unknown/shared paths stay as-is.
 */
function localizePath(path: string, locale: string): string {
  if (path === "/" || path === "") return "";
  const firstSlash = path.indexOf("/", 1);
  const firstSeg = firstSlash === -1 ? path : path.slice(0, firstSlash);
  const rest = firstSlash === -1 ? "" : path.slice(firstSlash);
  const translated = SEGMENT_MAP[firstSeg]?.[locale];
  return `${translated ?? firstSeg}${rest}`;
}

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
    result[tag] = `${SITE_URL}/${locale}${localizePath(normalized, locale)}`;
  }
  result["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${localizePath(normalized, DEFAULT_LOCALE)}`;
  return result;
}

/**
 * Build a self-referencing canonical URL for a TR-canonical path + locale.
 * Default locale (tr) is unprefixed; other locales get a `/locale` prefix.
 * The path's first segment is localized via SEGMENT_MAP.
 *   tr  + "/balonlar"  -> https://site/balonlar
 *   nl  + "/balonlar"  -> https://site/nl/ballonvaarten
 *   tr  + "/"          -> https://site
 *   nl  + "/"          -> https://site/nl
 */
export function canonicalFor(path: string, locale: string): string {
  const norm = path.startsWith("/") ? path : `/${path}`;
  const lp = localizePath(norm, locale);
  const tail = lp === "/" ? "" : lp;
  return locale === DEFAULT_LOCALE ? `${SITE_URL}${tail}` : `${SITE_URL}/${locale}${tail}`;
}

/**
 * Build dynamic OG image URL for `/api/og` endpoint.
 */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `/api/og?${params.toString()}`;
}
