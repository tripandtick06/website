import type { MetadataRoute } from "next";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { KAPADOKYA_PILLARS, HOTELS, ACTIVITIES, TOURS, PACKAGES, TRANSFERS } from "@/data/services/catalog";
import { OPERATORS } from "@/data/services/operators";
import { ARTICLES } from "@/data/blog";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";

// Auto-consumed by Next.js → /sitemap.xml. No source-file importer.
// Faz 4.1: TR canonical + alternates.languages for 9 locales.

// Honest lastModified dates: each constant mirrors the real last-commit date
// of its source file (`git log -1 --format=%cs -- <file>`), not build time.
// Update the date here whenever the corresponding source file next changes.
const BALLOONS_UPDATED_AT = new Date("2026-05-25"); // src/data/services/balloons.ts
const CATALOG_UPDATED_AT = new Date("2026-06-03"); // src/data/services/catalog.ts (hotels/activities/tours/packages/transfers/pillars)
const OPERATORS_UPDATED_AT = new Date("2026-05-15"); // src/data/services/operators.ts

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => `${SITE_URL}${p === "/" ? "" : p}`;
  const alt = (p: string) => ({ languages: generateHreflang(p) });

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: new Date("2026-06-03"), changeFrequency: "daily", priority: 1.0, alternates: alt("/") },
    { url: url("/balonlar"), lastModified: new Date("2026-06-04"), changeFrequency: "daily", priority: 0.9, alternates: alt("/balonlar") },
    { url: url("/kapadokya"), lastModified: new Date("2026-06-04"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/kapadokya") },
    { url: url("/oteller"), lastModified: new Date("2026-06-04"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/oteller") },
    { url: url("/aktiviteler"), lastModified: new Date("2026-06-04"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/aktiviteler") },
    { url: url("/turlar"), lastModified: new Date("2026-06-04"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/turlar") },
    { url: url("/paketler"), lastModified: new Date("2026-06-04"), changeFrequency: "weekly", priority: 0.8, alternates: alt("/paketler") },
    { url: url("/transferler"), lastModified: new Date("2026-06-04"), changeFrequency: "weekly", priority: 0.7, alternates: alt("/transferler") },
    { url: url("/operatorler"), lastModified: new Date("2026-06-03"), changeFrequency: "weekly", priority: 0.7, alternates: alt("/operatorler") },
    { url: url("/blog"), lastModified: new Date("2026-06-03"), changeFrequency: "daily", priority: 0.7, alternates: alt("/blog") },
    { url: url("/sss"), lastModified: new Date("2026-06-03"), changeFrequency: "monthly", priority: 0.7, alternates: alt("/sss") },
    { url: url("/yorum"), lastModified: new Date("2026-06-03"), changeFrequency: "weekly", priority: 0.5, alternates: alt("/yorum") },
    { url: url("/hakkimizda"), lastModified: new Date("2026-06-03"), changeFrequency: "monthly", priority: 0.5, alternates: alt("/hakkimizda") },
    { url: url("/iletisim"), lastModified: new Date("2026-06-03"), changeFrequency: "monthly", priority: 0.5, alternates: alt("/iletisim") },
    { url: url("/gizlilik-politikasi"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/gizlilik-politikasi") },
    { url: url("/kullanim-sartlari"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/kullanim-sartlari") },
    { url: url("/iptal-iade-politikasi"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/iptal-iade-politikasi") },
    { url: url("/cerez-politikasi"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/cerez-politikasi") },
    { url: url("/kvkk"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/kvkk") },
    { url: url("/gdpr"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/gdpr") },
    { url: url("/impressum"), lastModified: new Date("2026-06-03"), changeFrequency: "yearly", priority: 0.3, alternates: alt("/impressum") },
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

  // Blog canonical: TR unprefixed (matches other dynamic pages); hreflang
  // alternates cover EN/DE/other locales — keeps sitemap canonical consistent.
  const blogPages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: url(`/blog/${a.slug}`),
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
    alternates: alt(`/blog/${a.slug}`),
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
  const seen = new Set<string>();
  const deduped: MetadataRoute.Sitemap = [];
  for (const entry of combined) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    deduped.push(entry);
  }
  return deduped;
}
