import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL, articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { FOUNDER } from "@/data/founder";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { ARTICLES, type BlogArticle, type BlogArticleMeta } from "@/data/blog";
import { BlogArticleContent } from "./BlogArticleContent";

export const runtime = "edge";

// Icerik public/blog/*.json STATIK asset; runtime'da fetch ile alinir (Worker
// bundle 3 MiB limiti icin). SSG yok -> build-time fetch sorunu olmaz.
async function getArticle(slug: string): Promise<BlogArticle | null> {
  const meta = ARTICLES.find((a) => a.slug === slug);
  if (!meta) return null;
  try {
    const res = await fetch(`${SITE_URL}/blog/${meta.file}`, { cache: "force-cache" });
    if (!res.ok) return null;
    const full = (await res.json()) as { content?: string; faq?: BlogArticle["faq"] };
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
  return {
    title,
    description: article.metaDescription,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: generateHreflang(path),
    },
    openGraph: {
      title,
      description: article.metaDescription,
      url: `${SITE_URL}${path}`,
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
    authorUrl: `${SITE_URL}/hakkimizda`,
    keywords: article.tags,
  });

  const breadcrumbLd = breadcrumbSchema([
    { name: "Blog", href: "/blog" },
    { name: article.title, href: `/blog/${article.slug}` },
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
