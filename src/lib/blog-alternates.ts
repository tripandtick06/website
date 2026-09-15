// Blog article URL + hreflang helpers — single source of truth for the real
// public URL of an article and its translation cluster.
//
// Callers:
//   - src/app/sitemap.ts                      (blog entries + alternates)
//   - src/app/[locale]/blog/[slug]/page.tsx   (metadata.alternates.languages)
//
// Why (2026-09-15 live audit): sitemap.ts emitted every article as
// /blog/<slug> (TR-unprefixed) although non-TR articles only exist at
// /<locale>/blog/<slug> (generateStaticParams = (a.locale, a.slug)), so
// 154 of 251 sitemap URLs returned 404. The blog page had its own copy of
// the translation-matching loop; both now go through here.

import type { BlogArticleMeta } from "@/data/blog";
import { ARTICLES } from "@/data/blog";
import { SITE_URL } from "@/lib/schema";
import { INDEXABLE_LOCALES, isIndexableLocale } from "@/lib/locale-index";

const TAG: Record<string, string> = {
  tr: "tr-TR", en: "en", de: "de", fr: "fr", es: "es",
  nl: "nl", zh: "zh-Hans", hi: "hi", ur: "ur",
  pt: "pt-PT", "pt-BR": "pt-BR", ja: "ja", ko: "ko", it: "it",
  ru: "ru", uk: "uk", az: "az",
};

// pt-BR first (longest) — anchored `$` so order is not load-bearing, but explicit.
const SUFFIX_RE = /-(pt-BR|tr|en|de|fr|es|nl|zh|hi|ur|pt|ja|ko|it|ru|uk|az)$/;

/** Locale prefix for a URL path: tr is unprefixed, others get `/<locale>`. */
export function localePathPrefix(locale: string): string {
  return locale === "tr" ? "" : `/${locale}`;
}

/** Absolute public URL of an article — the ONLY shape that returns 200. */
export function blogArticleUrl(a: Pick<BlogArticleMeta, "slug" | "locale">): string {
  return `${SITE_URL}${localePathPrefix(a.locale)}/blog/${a.slug}`;
}

/** Shared base slug of a translation cluster (locale suffix stripped). */
export function blogBaseSlug(slug: string): string {
  return slug.replace(SUFFIX_RE, "");
}

/**
 * hreflang map for an article: every INDEXABLE locale that actually has a
 * translation (suffixed OR bare slug), keyed by BCP47 tag; x-default = tr
 * when a TR version exists. Pruned locales never appear (they are noindex).
 */
export function blogAlternates(
  a: Pick<BlogArticleMeta, "slug" | "locale">,
  articles: readonly Pick<BlogArticleMeta, "slug" | "locale">[] = ARTICLES
): Record<string, string> {
  const base = blogBaseSlug(a.slug);
  const languages: Record<string, string> = {};
  for (const loc of INDEXABLE_LOCALES) {
    const match = articles.find(
      (x) =>
        x.locale === loc &&
        !(x as { noindex?: boolean }).noindex &&
        (x.slug === `${base}-${loc}` || x.slug === base)
    );
    if (!match) continue;
    const href = blogArticleUrl(match);
    languages[TAG[loc]] = href;
    if (loc === "tr") languages["x-default"] = href;
  }
  return languages;
}

/** Articles that belong in the sitemap: indexable locales only. */
export function sitemapArticles(
  articles: readonly BlogArticleMeta[] = ARTICLES
): BlogArticleMeta[] {
  return articles.filter((a) => isIndexableLocale(a.locale) && !a.noindex);
}

// Article metaTitles often already end with the brand suffix; the layout's
// title.template appends the brand again (doubled brand on 7/7 sampled live
// articles, audit 2026-09-15). Strip one trailing brand.
const BRAND_SUFFIX_RE = /\s*[|\-–—]\s*Trip\s*(?:and|&)\s*Tick\s*$/i;
export function stripBrandSuffix(title: string): string {
  return title.replace(BRAND_SUFFIX_RE, "").trim();
}
