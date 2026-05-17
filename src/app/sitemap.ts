import type { MetadataRoute } from "next";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { KAPADOKYA_PILLARS, HOTELS } from "@/data/services/catalog";
import { OPERATORS } from "@/data/services/operators";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";

// Auto-consumed by Next.js → /sitemap.xml. No source-file importer.
// Faz 4.1: TR canonical + alternates.languages for 9 locales.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => `${SITE_URL}/tr${p === "/" ? "" : p}`;
  const alt = (p: string) => ({ languages: generateHreflang(p) });

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1.0, alternates: alt("/") },
    { url: url("/balonlar"), lastModified: now, changeFrequency: "daily", priority: 0.9, alternates: alt("/balonlar") },
    { url: url("/kapadokya"), lastModified: now, changeFrequency: "weekly", priority: 0.8, alternates: alt("/kapadokya") },
    { url: url("/oteller"), lastModified: now, changeFrequency: "weekly", priority: 0.8, alternates: alt("/oteller") },
    { url: url("/aktiviteler"), lastModified: now, changeFrequency: "weekly", priority: 0.8, alternates: alt("/aktiviteler") },
    { url: url("/turlar"), lastModified: now, changeFrequency: "weekly", priority: 0.8, alternates: alt("/turlar") },
    { url: url("/paketler"), lastModified: now, changeFrequency: "weekly", priority: 0.8, alternates: alt("/paketler") },
    { url: url("/transferler"), lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: alt("/transferler") },
    { url: url("/operatorler"), lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: alt("/operatorler") },
    { url: url("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.7, alternates: alt("/blog") },
    { url: url("/sss"), lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: alt("/sss") },
    { url: url("/yorum"), lastModified: now, changeFrequency: "weekly", priority: 0.5, alternates: alt("/yorum") },
    { url: url("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: 0.5, alternates: alt("/hakkimizda") },
    { url: url("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: 0.5, alternates: alt("/iletisim") },
    { url: url("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: alt("/gizlilik-politikasi") },
    { url: url("/kullanim-sartlari"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: alt("/kullanim-sartlari") },
    { url: url("/iptal-iade-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: alt("/iptal-iade-politikasi") },
    { url: url("/cerez-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: alt("/cerez-politikasi") },
    { url: url("/kvkk"), lastModified: now, changeFrequency: "yearly", priority: 0.3, alternates: alt("/kvkk") },
  ];

  const balloonPages: MetadataRoute.Sitemap = BALLOON_PACKAGES.map((pkg) => ({
    url: url(`/balonlar/${pkg.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: alt(`/balonlar/${pkg.slug}`),
  }));

  const hotelPages: MetadataRoute.Sitemap = HOTELS.map((h) => ({
    url: url(`/oteller/${h.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: alt(`/oteller/${h.slug}`),
  }));

  const operatorPages: MetadataRoute.Sitemap = OPERATORS.map((op) => ({
    url: url(`/operatorler/${op.id}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: alt(`/operatorler/${op.id}`),
  }));

  const pillarPages: MetadataRoute.Sitemap = KAPADOKYA_PILLARS.map((p) => ({
    url: url(`/blog/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: alt(`/blog/${p.slug}`),
  }));

  // TODO Q2: blog pages edge-compat content loader (glob-import / KV)
  const blogPages: MetadataRoute.Sitemap = [];

  // Dedupe — bazi pillar slug'lari blog JSON slug'lariyla cakisir (intentional).
  const combined = [...staticPages, ...operatorPages, ...balloonPages, ...hotelPages, ...pillarPages, ...blogPages];
  const seen = new Set<string>();
  const deduped: MetadataRoute.Sitemap = [];
  for (const entry of combined) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    deduped.push(entry);
  }
  return deduped;
}
