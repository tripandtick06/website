// Locale index policy — which locales Google may index (2026-09-15 prune).
//
// Callers:
//   - src/lib/hreflang.ts            (hreflang cluster = indexable locales only)
//   - src/app/[locale]/layout.tsx    (robots meta per locale)
//   - src/app/[locale]/blog/[slug]/page.tsx, src/app/[locale]/impressum/page.tsx
//   - src/middleware.ts              (X-Robots-Tag header, independent of page metadata)
//
// Why: GSC impressions collapsed from 46-85/day (17-23 Aug 2026) to 0-4/day
// from 25 Aug with no deploy in between and pages still indexed — the window of
// Google's August 2026 spam update (scaled / machine-translated content). The
// site carried 17 locales of machine-translated pages; 90-day GSC per locale
// (clicks/impressions/pages): tr 6/524/29 · en 3/423/54 · pt-BR 3/302/3 ·
// ja 2/169/17 · fr 2/158/19 · de 2/145/26 · ko 1/84/16 — everything else
// ≤ 87 impressions. Owner decision 2026-09-15: keep those seven indexable,
// noindex (follow) the rest. Pages stay online and reachable for visitors;
// only search-engine indexing + the hreflang cluster change. Reversible by
// editing INDEXABLE_LOCALES (the guard test in tests/lib/locale-index.test.ts
// must be updated with the reason).

export const INDEXABLE_LOCALES = ["tr", "en", "pt-BR", "ja", "fr", "de", "ko"] as const;

export const NOINDEX_LOCALES = [
  "es", "nl", "zh", "hi", "ur", "pt", "it", "ru", "uk", "az",
] as const;

export type IndexableLocale = (typeof INDEXABLE_LOCALES)[number];

const INDEXABLE_SET: ReadonlySet<string> = new Set(INDEXABLE_LOCALES);

export function isIndexableLocale(locale: string): boolean {
  return INDEXABLE_SET.has(locale);
}

/** Next.js `robots` metadata for a locale — noindex,follow for pruned locales. */
export function robotsForLocale(locale: string): { index: boolean; follow: boolean } {
  return { index: isIndexableLocale(locale), follow: true };
}

// First path segment of a locale-prefixed URL, e.g. "/es/hoteles" -> "es",
// "/pt-BR/hotels" -> "pt-BR", "/balonlar" -> null (tr is unprefixed).
const PREFIX_RE = /^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/;

/** True when the request path belongs to a locale that must not be indexed. */
export function isNoindexPath(pathname: string): boolean {
  const m = PREFIX_RE.exec(pathname);
  if (!m) return false;
  return (NOINDEX_LOCALES as readonly string[]).includes(m[1]);
}
