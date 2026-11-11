import type { MetadataRoute } from "next";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { KAPADOKYA_PILLARS, HOTELS, ACTIVITIES, TOURS, PACKAGES, TRANSFERS } from "@/data/services/catalog";
import { OPERATORS } from "@/data/services/operators";
import { blogAlternates, blogArticleUrl, sitemapArticles } from "@/lib/blog-alternates";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";
import { PAGE_UPDATED } from "@/lib/page-dates";

// Auto-consumed by Next.js → /sitemap.xml. No source-file importer.
// Faz 4.1: TR canonical + alternates.languages for 9 locales.

// Honest lastModified dates: each constant mirrors the real last-commit date
// of its source file (`git log -1 --format=%cs -- <file>`), not build time.
// Update the date here whenever the corresponding source file next changes.
// Guard: tests/lib/sitemap-lastmod.test.ts fails when a source file has a newer commit.
const BALLOONS_UPDATED_AT = new Date("2026-09-18"); // src/data/services/balloons.ts
const CATALOG_UPDATED_AT = new Date("2026-09-18"); // src/data/services/catalog.ts (hotels/activities/tours/packages/transfers/pillars)
const OPERATORS_UPDATED_AT = new Date("2026-09-18"); // src/data/services/operators.ts

// Static pages: PAGE_UPDATED (src/lib/page-dates.ts) is the single source for the
// visible "last updated" date and JSON-LD dateModified; sitemap lastmod mirrors it.
const pageDate = (p: string, fallback: Date): Date => {
  const d = (PAGE_UPDATED as Record<string, string>)[p];
  return d ? new Date(d) : fallback;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => `${SITE_URL}${p === "/" ? "" : p}`;
  const alt = (p: string) => ({ languages: generateHreflang(p) });

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: pageDate("/", new Date("2026-06-03")), changeFrequency: "daily", priority: 1.0, alternates: alt("/") },
    { url: url("/balonlar"), lastModified: pageDate("/balonlar", new Date("2026-06-04")), changeFrequency: "daily", priority: 0.9, alternates: alt("/balonlar") },
    { url: url("/kapadokya"), lastModified: pageDate("/kapadokya", CATALOG_UPDATED_AT), changeFrequency: "weekly", priority: 0.8, alternates: alt("/kapadokya") },
    { url: url("/oteller"), lastModified: pageDate("/oteller", CATALOG_UPDATED_AT), changeFrequency: "weekly", priority: 0.8, alternates: alt("/oteller") },
    { url: url("/aktiviteler"), lastModified: pageDate("/aktiviteler", CATALOG_UPDATED_AT), changeFrequency: "weekly", priority: 0.8, alternates: alt("/aktiviteler") },
    { url: url("/turlar"), lastModified: pageDate("/turlar", new Date("2026-06-04")), changeFrequency: "weekly", priority: 0.8, alternates: alt("/turlar") },
    { url: url("/paketler"), lastModified: pageDate("/paketler", CATALOG_UPDATED_AT), changeFrequency: "weekly", priority: 0.8, alternates: alt("/paketler") },
    { url: url("/transferler"), lastModified: pageDate("/transferler", CATALOG_UPDATED_AT), changeFrequency: "weekly", priority: 0.7, alternates: alt("/transferler") },
    { url: url("/operatorler"), lastModified: pageDate("/operatorler", new Date("2026-06-03")), changeFrequency: "weekly", priority: 0.7, alternates: alt("/operatorler") },
    { url: url("/blog"), lastModified: pageDate("/blog", new Date("2026-06-03")), changeFrequency: "daily", priority: 0.7, alternates: alt("/blog") },
    { url: url("/sss"), lastModified: pageDate("/sss", new Date("2026-06-03")), changeFrequency: "monthly", priority: 0.7, alternates: alt("/sss") },
    { url: url("/yorum"), lastModified: pageDate("/yorum", new Date("2026-06-03")), changeFrequency: "weekly", priority: 0.5, alternates: alt("/yorum") },
    { url: url("/hakkimizda"), lastModified: pageDate("/hakkimizda", new Date("2026-06-03")), changeFrequency: "monthly", priority: 0.5, alternates: alt("/hakkimizda") },
    { url: url("/iletisim"), lastModified: pageDate("/iletisim", new Date("2026-06-03")), changeFrequency: "monthly", priority: 0.5, alternates: alt("/iletisim") },
    { url: url("/gizlilik-politikasi"), lastModified: pageDate("/gizlilik-politikasi", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/gizlilik-politikasi") },
    { url: url("/kullanim-sartlari"), lastModified: pageDate("/kullanim-sartlari", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/kullanim-sartlari") },
    { url: url("/iptal-iade-politikasi"), lastModified: pageDate("/iptal-iade-politikasi", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/iptal-iade-politikasi") },
    { url: url("/cerez-politikasi"), lastModified: pageDate("/cerez-politikasi", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/cerez-politikasi") },
    { url: url("/kvkk"), lastModified: pageDate("/kvkk", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/kvkk") },
    { url: url("/gdpr"), lastModified: pageDate("/gdpr", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/gdpr") },
    { url: url("/impressum"), lastModified: pageDate("/impressum", new Date("2026-06-03")), changeFrequency: "yearly", priority: 0.3, alternates: alt("/impressum") },
  ];

  // NL pages with hand-written Dutch copy (opt-in list: NL_INDEXABLE_PATHS in locale-index.ts).
  // Own <url> entries; alternates = same single hreflang producer as the TR twins.
  const nlPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/nl`, lastModified: new Date("2026-10-17"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/") },
    { url: `${SITE_URL}/nl/ballonvaarten`, lastModified: new Date("2026-10-17"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/balonlar") },
  ];

  // English-only sourced fact dataset (no hreflang cluster; other locales 404).
  // Date mirrors `checked` in src/data/datasets/cappadocia-balloon-facts.json.
  const factsIndexPage: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/en/cappadocia-balloon-facts-index`, lastModified: new Date("2026-10-09"), changeFrequency: "monthly", priority: 0.7 },
  ];

  const balloonPages: MetadataRoute.Sitemap = BALLOON_PACKAGES.map((pkg) => ({
    url: url(`/balonlar/${pkg.slug}`),
    lastModified: BALLOONS_UPDATED_AT,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: alt(`/balonlar/${pkg.slug}`),
  }));

  const hotelPages: MetadataRoute.Sitemap = HOTELS.map((h) => ({
    url: url(`/oteller/${h.slug}`),
    lastModified: CATALOG_UPDATED_AT,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: alt(`/oteller/${h.slug}`),
  }));

  const operatorPages: MetadataRoute.Sitemap = OPERATORS.map((op) => ({
    url: url(`/operatorler/${op.id}`),
    lastModified: OPERATORS_UPDATED_AT,
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: alt(`/operatorler/${op.id}`),
  }));

  const pillarPages: MetadataRoute.Sitemap = KAPADOKYA_PILLARS.map((p) => ({
    url: url(`/blog/${p.slug}`),
    lastModified: CATALOG_UPDATED_AT,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: alt(`/blog/${p.slug}`),
  }));

  // Blog: one entry per article at its REAL URL (/<locale>/blog/<slug>; tr
  // unprefixed), indexable locales only, alternates = actual translations.
  // Live audit 2026-09-15: the old /blog/<slug> shape 404'd for 154 of 251
  // sitemap URLs. Guard: tests/lib/blog-alternates.test.ts.
  const blogPages: MetadataRoute.Sitemap = sitemapArticles().map((a) => ({
    url: blogArticleUrl(a),
    lastModified: a.updatedAt || a.publishedAt ? new Date(a.updatedAt || a.publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
    alternates: { languages: blogAlternates(a) },
  }));

  const mk = (
    items: { slug: string }[],
    base: string,
    priority: number
  ): MetadataRoute.Sitemap =>
    items.map((it) => ({
      url: url(`${base}/${it.slug}`),
      lastModified: CATALOG_UPDATED_AT,
      changeFrequency: "weekly" as const,
      priority,
      alternates: alt(`${base}/${it.slug}`),
    }));
  const activityPages = mk(ACTIVITIES, "/aktiviteler", 0.8);
  const tourPages = mk(TOURS, "/turlar", 0.8);
  const packagePages = mk(PACKAGES, "/paketler", 0.8);
  const transferPages = mk(TRANSFERS, "/transferler", 0.7);

  // Dedupe — bazi pillar slug'lari blog JSON slug'lariyla cakisir (intentional).
  const combined = [
    ...staticPages,
    ...nlPages,
    ...factsIndexPage,
    ...operatorPages,
    ...balloonPages,
    ...hotelPages,
    ...activityPages,
    ...tourPages,
    ...packagePages,
    ...transferPages,
    ...pillarPages,
    ...blogPages,
  ];
  // On collision keep the first entry but the NEWEST lastModified — a pillar URL
  // must not hide the 11-11 update of the blog article served at the same URL.
  const seen = new Map<string, number>();
  const deduped: MetadataRoute.Sitemap = [];
  for (const entry of combined) {
    const i = seen.get(entry.url);
    if (i === undefined) {
      seen.set(entry.url, deduped.length);
      deduped.push(entry);
      continue;
    }
    const prev = deduped[i];
    const t = (d: string | Date | undefined) => (d ? new Date(d).getTime() : 0);
    if (t(entry.lastModified) > t(prev.lastModified)) {
      deduped[i] = { ...prev, lastModified: entry.lastModified };
    }
  }
  return deduped;
}
