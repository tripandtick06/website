import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { ARTICLES, type BlogArticleMeta } from "@/data/blog";
import { BlogContent } from "./BlogContent";

// CF Pages edge runtime. Liste metadata manifest'ten (icerik statik asset).
export const runtime = "edge";

async function getBlogArticles(): Promise<BlogArticleMeta[]> {
  return ARTICLES;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { DICTIONARIES, isLocale, DEFAULT_LOCALE } = await import(
    "@/lib/i18n/dictionaries"
  );
  const loc = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.blog;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/blog", params.locale),
      languages: generateHreflang("/blog"),
      types: {
        "application/rss+xml": `${SITE_URL}/blog/rss.xml`,
      },
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/blog`,
      type: "website",
      images: [
        {
          url: ogImageUrl(d.meta_title_2, d.meta_desc_2),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { locale: string };
}) {
  const { isLocale, DEFAULT_LOCALE } = await import("@/lib/i18n/dictionaries");
  const loc = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const all = await getBlogArticles();
  // Sadece aktif dilin makaleleri (her konu 9 dile cevrildi).
  const articles = all.filter((a) => a.locale === loc);
  return <BlogContent articles={articles} />;
}
