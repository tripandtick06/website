// AUTO-LISTED — yeni blog JSON eklendiginde manuel import + ARTICLES array'e ekle.
// Edge runtime fs okuyamaz, bu yuzden build-time static import gerekiyor.
//
// Importers: src/app/blog/[slug]/page.tsx, sitemap.ts, blog/page.tsx, blog/rss.xml/route.ts

import en1 from "./en-cappadocia-hot-air-balloon-price-2026.json";
import en2 from "./en-cappadocia-winter-2026-guide.json";
import de1 from "./de-heissluftballon-kappadokien-preise.json";
import tr1 from "./tr-kapadokya-aktiviteler.json";
import tr2 from "./tr-kapadokya-balon-turu-fiyat-2026.json";
import tr3 from "./tr-kapadokya-fotograf-noktalari.json";
import tr4 from "./tr-kapadokya-istanbuldan-nasil-gidilir.json";
import tr5 from "./tr-kapadokya-ne-zaman-gidilir.json";
import tr6 from "./tr-kapadokya-otel-tavsiye-2026.json";
import tr7 from "./tr-kapadokya-dugun-fotografciligi.json";

export interface BlogArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  targetKeyword: string;
  locale: string;
  publishedAt: string;
  seoScore: number;
  isAiGenerated?: boolean;
}

export const ARTICLES: BlogArticle[] = [
  en1 as BlogArticle,
  en2 as BlogArticle,
  de1 as BlogArticle,
  tr1 as BlogArticle,
  tr2 as BlogArticle,
  tr3 as BlogArticle,
  tr4 as BlogArticle,
  tr5 as BlogArticle,
  tr6 as BlogArticle,
  tr7 as BlogArticle,
];
