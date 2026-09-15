import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { SITE_URL, breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { ARTICLES, type BlogArticleMeta } from "@/data/blog";
import { blogArticleUrl } from "@/lib/blog-alternates";
import { serverDict } from "@/lib/i18n/serverDict";
import { BlogContent } from "./BlogContent";
import { routing } from "@/i18n/routing";

// CF Pages edge runtime. Liste metadata manifest'ten (icerik statik asset).
// Static prerender (2026-09-16): this page reads only dictionaries/catalog —
// no headers()/cookies()/searchParams — so it is built once per locale and
// served as a static asset by Cloudflare Pages instead of edge-rendered per
// request (Lighthouse: ~0.9 s TTFB on every listing page). Live prices stay
// client-side. Guard: tests/lib/static-listing-pages.test.ts
export const dynamic = "force-static";
// next-on-pages: without dynamicParams=false the route is SSG-with-fallback
// and the Cloudflare build refuses it ("not configured to run with the Edge
// Runtime"). Locales come from the layout's generateStaticParams.
export const dynamicParams = false;
// Own generateStaticParams (not only the layout's): next-on-pages only treats
// a route as prerendered when the page itself enumerates its params — the
// detail pages already do this; without it the Cloudflare build fails with
// "not configured to run with the Edge Runtime".
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

async function getBlogArticles(): Promise<BlogArticleMeta[]> {
  return ARTICLES;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { isLocale, DEFAULT_LOCALE } = await import(
    "@/lib/i18n/dictionaries"
  );
  const loc = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.blog;
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
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/blog", params.locale),
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
  const d = serverDict(loc);
  // JSON-LD ItemList: indexable articles only (noindex pages stay reachable
  // in the UI list per item 6, but must not be claimed as a citable catalogue).
  const indexableArticles = articles.filter((a) => !a.noindex);
  return (
    <>
      <BlogContent articles={articles} />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: d.nav.blog, href: canonicalFor("/blog", loc) }]),
          itemListSchema(
            indexableArticles.map((a) => ({ name: a.title, urlPath: blogArticleUrl(a) })),
            d.page.blog.meta_title
          ),
        ]}
      />
    </>
  );
}
