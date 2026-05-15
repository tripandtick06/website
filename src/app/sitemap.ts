import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import {
  ACTIVITIES,
  TOURS,
  HOTELS,
  PACKAGES,
  TRANSFERS,
  KAPADOKYA_PILLARS,
} from "@/data/services/catalog";
import { SITE_URL } from "@/lib/schema";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => `${SITE_URL}${p}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: url("/balonlar"), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: url("/oteller"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: url("/aktiviteler"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: url("/turlar"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: url("/paketler"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: url("/transferler"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: url("/kapadokya"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: url("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: url("/sss"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: url("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/kullanim-sartlari"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/iptal-iade-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/cerez-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/kvkk"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const balloonPages: MetadataRoute.Sitemap = BALLOON_PACKAGES.map((pkg) => ({
    url: url(`/balonlar/${pkg.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const serviceCatalogs = [
    ...ACTIVITIES,
    ...TOURS,
    ...HOTELS,
    ...PACKAGES,
    ...TRANSFERS,
  ];
  const servicePages: MetadataRoute.Sitemap = serviceCatalogs.map((s) => ({
    url: url(`/rezervasyon/${s.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const pillarPages: MetadataRoute.Sitemap = KAPADOKYA_PILLARS.map((p) => ({
    url: url(`/blog/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
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
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // sessiz hata — sitemap derlenebilmeli
  }

  return [...staticPages, ...balloonPages, ...servicePages, ...pillarPages, ...blogPages];
}
