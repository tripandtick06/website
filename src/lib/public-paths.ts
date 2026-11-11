// Tek-kaynak public URL path listesi — IndexNow postbuild + /api/indexnow + (ileride
// sitemap) ayni yuzeyi paylasir. RELATIVE import: hem Next build hem tsx (postbuild)
// cozebilsin (tsx tsconfig "paths" alias'ini cozmez).

import { BALLOON_PACKAGES } from "../data/services/balloons";
import { KAPADOKYA_PILLARS, HOTELS } from "../data/services/catalog";
import { OPERATORS } from "../data/services/operators";
import { ARTICLES } from "../data/blog";
import { isIndexableBlogSlug } from "./locale-index";

/** Indexlenebilir statik (TR-canonical, prefix'siz) path'ler. */
export const STATIC_PATHS: string[] = [
  "/",
  "/balonlar",
  "/oteller",
  "/aktiviteler",
  "/turlar",
  "/paketler",
  "/transferler",
  "/operatorler",
  "/kapadokya",
  "/blog",
  "/sss",
  "/yorum",
  "/hakkimizda",
  "/iletisim",
  "/gizlilik-politikasi",
  "/kullanim-sartlari",
  "/iptal-iade-politikasi",
  "/cerez-politikasi",
  "/kvkk",
  "/gdpr",
  "/impressum",
];

/**
 * Tum public TR-canonical path'leri (statik + dinamik detay sayfalari), dedupe'lu.
 * sitemap.ts ile ayni veri kaynaklarini kullanir.
 */
export function allPublicPaths(): string[] {
  const paths = [...STATIC_PATHS];
  for (const b of BALLOON_PACKAGES) paths.push(`/balonlar/${b.slug}`);
  for (const h of HOTELS) paths.push(`/oteller/${h.slug}`);
  for (const o of OPERATORS) paths.push(`/operatorler/${o.id}`);
  for (const k of KAPADOKYA_PILLARS) paths.push(`/blog/${k.slug}`);
  // Same shape + filter as sitemapArticles(): /<locale>/blog/<slug> (tr unprefixed),
  // indexable locales only. The old /blog/<slug> for every locale 404'd for non-TR.
  for (const a of ARTICLES) {
    if (!isIndexableBlogSlug(a.locale, a.slug) || a.noindex) continue;
    paths.push(`${a.locale === "tr" ? "" : `/${a.locale}`}/blog/${a.slug}`);
  }
  return Array.from(new Set(paths));
}

/** Path -> absolute URL (TR-canonical; "/" -> bare host). */
export function toAbsolute(path: string, siteUrl: string): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path === "/" ? "" : path}`;
}
