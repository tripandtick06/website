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

// 2026-10-17 NL opening (SEO research 4A): Dutch is the one target market where
// the SERP has no operator site (blogs + GetYourGuide/TripAdvisor only), so the
// pruned `nl` locale is re-opened PAGE BY PAGE, never wholesale. Only pages with
// original, hand-written Dutch copy are indexable; every other /nl/* page (still
// machine-translated catalogue pages) stays noindex,follow and out of hreflang.
// Keys are TR-canonical paths (same shape generateHreflang() takes).
export const NL_INDEXABLE_PATHS = ["/", "/balonlar"] as const;

// Hand-written Dutch blog articles (public/blog/nl-*.json with these slugs).
// The 8 older nl-* articles are translations of Turkish originals and stay noindex.
export const NL_EDITORIAL_BLOG_SLUGS = [
  "beste-tijd-ballonvaart-cappadocie",
  "kosten-ballonvaart-cappadocie",
] as const;

export function isIndexablePath(locale: string, trPath: string): boolean {
  if (isIndexableLocale(locale)) return true;
  if (locale !== "nl") return false;
  return (NL_INDEXABLE_PATHS as readonly string[]).includes(trPath === "" ? "/" : trPath);
}

export function isIndexableBlogSlug(locale: string, slug: string): boolean {
  if (isIndexableLocale(locale)) return true;
  return locale === "nl" && (NL_EDITORIAL_BLOG_SLUGS as readonly string[]).includes(slug);
}

/** robots metadata for a page: page-level override of the locale default. */
export function robotsForPage(locale: string, trPath: string): { index: boolean; follow: boolean } {
  return { index: isIndexablePath(locale, trPath), follow: true };
}

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
  if (!(NOINDEX_LOCALES as readonly string[]).includes(m[1])) return false;
  if (m[1] === "nl" && isNlIndexableUrlPath(pathname)) return false;
  return true;
}

// Real URL paths (nl slugs, see routing.pathnames) of the re-opened NL pages.
function isNlIndexableUrlPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (p === "/nl" || p === "/nl/ballonvaarten") return true;
  const blog = /^\/nl\/blog\/([^/]+)$/.exec(p);
  return !!blog && (NL_EDITORIAL_BLOG_SLUGS as readonly string[]).includes(blog[1]);
}
