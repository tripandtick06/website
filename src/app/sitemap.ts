import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { KAPADOKYA_PILLARS } from "@/data/services/catalog";
import { SITE_URL } from "@/lib/schema";

// Auto-consumed by Next.js → /sitemap.xml. No source-file importer.
// Reads: src/data/blog/*.json (fields used: filename only for slug derivation).
// /rezervasyon/* intentionally excluded — funnel pages, noindex.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => `${SITE_URL}${p}`;

  const staticPages: MetadataRoute.Sitemap = [
    // Home — top priority, frequently updated content.
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },

    // Money pages.
    { url: url("/balonlar"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: url("/kapadokya"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    // Category hubs.
    { url: url("/oteller"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/aktiviteler"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/turlar"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/paketler"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: url("/transferler"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },

    // Editorial.
    { url: url("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.7 },

    // Support / SSS.
    { url: url("/sss"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Trust / brand.
    { url: url("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: url("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    // Legal — low priority, rare changes.
    { url: url("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/kullanim-sartlari"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/iptal-iade-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/cerez-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/kvkk"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const balloonPages: MetadataRoute.Sitemap = BALLOON_PACKAGES.map((pkg) => ({
    url: url(`/balonlar/${pkg.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const pillarPages: MetadataRoute.Sitemap = KAPADOKYA_PILLARS.map((p) => ({
    url: url(`/blog/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogDir = path.join(process.cwd(), "src", "data", "blog");
    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        const slug = file.replace(/^(tr|en|de|fr|es|nl|zh|hi|ur)-/, "").replace(/\.json$/, "");
        blogPages.push({
          url: url(`/blog/${slug}`),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // sessiz hata — sitemap derlenebilmeli
  }

  return [...staticPages, ...balloonPages, ...pillarPages, ...blogPages];
}
