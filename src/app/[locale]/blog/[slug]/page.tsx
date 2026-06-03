import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL, articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { FOUNDER } from "@/data/founder";
import { ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
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
  const title = article.metaTitle || article.title;

  // Per-locale hreflang for blog detail: each locale owns a DISTINCT slug
  // (e.g. `-de`, `-en`); some tr/en slugs are bare (no suffix). Derive the
  // shared base by stripping any trailing locale suffix, then resolve each
  // locale to its own article slug (suffixed OR bare). Only emit locales that
  // actually have a translation. x-default points to the tr version.
  const SUPPORTED = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur", "pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"] as const;
  const TAG: Record<string, string> = {
    tr: "tr-TR", en: "en", de: "de", fr: "fr", es: "es",
    nl: "nl", zh: "zh-Hans", hi: "hi", ur: "ur",
    pt: "pt-PT", "pt-BR": "pt-BR", ja: "ja", ko: "ko", it: "it",
    ru: "ru", uk: "uk", az: "az",
  };
  // pt-BR once (uzun) eslesir; anchored $ oldugu icin sira onemsiz ama acik tutuldu.
  const base = article.slug.replace(/-(pt-BR|tr|en|de|fr|es|nl|zh|hi|ur|pt|ja|ko|it|ru|uk|az)$/, "");
  const languages: Record<string, string> = {};
  for (const loc of SUPPORTED) {
    const match = ARTICLES.find(
      (a) => a.locale === loc && (a.slug === `${base}-${loc}` || a.slug === base)
    );
    if (!match) continue;
    const href = `${SITE_URL}${loc === "tr" ? "" : `/${loc}`}/blog/${match.slug}`;
    languages[TAG[loc]] = href;
    if (loc === "tr") languages["x-default"] = href;
  }

  return {
    title,
    description: article.metaDescription,
    robots: { index: true, follow: true },
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
    author: FOUNDER.name,
    authorType: "Person",
    authorUrl: canonicalFor("/hakkimizda", loc),
    keywords: article.tags,
    urlPath: articleUrl,
  });

  const breadcrumbLd = breadcrumbSchema([
    { name: DICTIONARIES[loc].nav.blog, href: canonicalFor("/blog", loc) },
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
