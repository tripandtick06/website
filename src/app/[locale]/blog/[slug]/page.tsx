import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL, articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { robotsForLocale } from "@/lib/locale-index";
import { blogAlternates, stripBrandSuffix } from "@/lib/blog-alternates";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { ARTICLES, type BlogArticle, type BlogArticleMeta } from "@/data/blog";
import { BlogArticleContent } from "./BlogArticleContent";

// Tum makaleler build-time SSG -> statik HTML (indexlenebilir, noindex YOK).
// Icerik public/blog/*.json'dan build'de fs ile okunur (Worker bundle'a girmez,
// 3 MiB limiti korunur). dynamicParams=false -> sadece bilinen sluglar.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ locale: a.locale, slug: a.slug }));
}

function getArticle(slug: string): BlogArticle | null {
  const meta = ARTICLES.find((a) => a.slug === slug);
  if (!meta) return null;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "public", "blog", meta.file), "utf8");
    const full = JSON.parse(raw) as { content?: string; faq?: BlogArticle["faq"] };
    return { ...meta, content: full.content ?? "", faq: full.faq };
  } catch {
    return null;
  }
}

function getRelatedArticles(currentSlug: string, category: string, locale: string): BlogArticleMeta[] {
  return ARTICLES.filter(
    (a) => a.slug !== currentSlug && a.category === category && a.locale === locale
  ).slice(0, 3);
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) return { title: "Yazı Bulunamadı" };

  const path = `/blog/${article.slug}`;
  // Article metaTitles often already end with the brand suffix; the layout's
  // title.template appends the brand again (doubled brand on 7/7 sampled
  // live articles, audit 2026-09-15). Strip a trailing brand here.
  const title = stripBrandSuffix(article.metaTitle || article.title);

  // hreflang cluster: translations of this article in indexable locales
  // (src/lib/blog-alternates.ts — shared with sitemap.ts).
  const languages = blogAlternates(article);

  return {
    title,
    description: article.metaDescription,
    robots: article.noindex ? { index: false, follow: true } : robotsForLocale(params.locale),
    alternates: {
      canonical: canonicalFor(path, params.locale),
      languages,
    },
    openGraph: {
      locale: ogLocale(isLocale(params.locale) ? params.locale : DEFAULT_LOCALE),
      title,
      description: article.metaDescription,
      url: canonicalFor(path, params.locale),
      type: "article",
      publishedTime: article.publishedAt,
      tags: article.tags,
      images: [
        {
          url: ogImageUrl(title.slice(0, 100), article.excerpt?.slice(0, 140)),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.metaDescription,
      images: [ogImageUrl(title.slice(0, 100), article.excerpt?.slice(0, 140))],
    },
  };
}

// Simple Markdown to HTML renderer (no external dependency)
function renderMarkdown(content: string): string {
  return content
    // H3 before H2 to avoid double matching
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-slate-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-extrabold text-slate-900 mt-10 mb-4">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-primary hover:text-accent underline transition-colors">$1</a>'
    )
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-600">$1</li>')
    // Paragraphs (lines that aren't already wrapped)
    .replace(/^(?!<[hla-z])(.+)$/gm, '<p class="text-slate-600 leading-relaxed mb-4">$1</p>')
    // Wrap consecutive <li> tags in <ul>
    .replace(
      /(<li[^>]*>.*<\/li>\n?)+/g,
      '<ul class="list-disc space-y-1.5 mb-6 pl-4">$&</ul>'
    );
}

export default async function BlogArticlePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const articleUrl = canonicalFor(`/blog/${article.slug}`, loc);
  const related = getRelatedArticles(article.slug, article.category, article.locale);
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  const renderedContent = renderMarkdown(article.content);

  const articleLd = articleSchema({
    slug: article.slug,
    title: article.title,
    description: article.metaDescription,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    // Organization author: there is no named human author behind these
    // articles (2026-09-15 trust cleanup — no placeholder Person nodes).
    authorType: "Organization",
    keywords: article.tags,
    urlPath: articleUrl,
  });

  const breadcrumbLd = breadcrumbSchema([
    { name: serverDict(loc).nav.blog, href: canonicalFor("/blog", loc) },
    { name: article.title, href: articleUrl },
  ]);

  // FAQPage JSON-LD — only emitted when the article supplies a `faq` array.
  // Answers must mirror the visible "Frequently Asked Questions" section.
  const faqLd =
    article.faq && article.faq.length > 0 ? faqPageSchema(article.faq) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <BlogArticleContent
        article={article}
        related={related}
        readTime={readTime}
        renderedContent={renderedContent}
      />
    </>
  );
}
