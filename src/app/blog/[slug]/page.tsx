import { ArrowLeft, Calendar, Tag, User, Share2, Clock } from "lucide-react";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

interface BlogArticle {
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
}

const CATEGORY_LABELS: Record<string, string> = {
  "balon-turlari": "Balon Turları",
  "kapadokya-rehber": "Kapadokya Rehberi",
  "aktiviteler": "Aktiviteler",
  "konaklama": "Konaklama",
  "ulasim": "Ulaşım",
  "genel": "Genel",
};

async function getArticle(slug: string): Promise<BlogArticle | null> {
  const blogDir = path.join(process.cwd(), "src", "data", "blog");
  try {
    const files = await fs.readdir(blogDir);
    for (const file of files.filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
      const content = await fs.readFile(path.join(blogDir, file), "utf-8");
      const article = JSON.parse(content) as BlogArticle;
      if (article.slug === slug) return article;
    }
  } catch {}
  return null;
}

async function getRelatedArticles(currentSlug: string, category: string): Promise<BlogArticle[]> {
  const blogDir = path.join(process.cwd(), "src", "data", "blog");
  try {
    const files = await fs.readdir(blogDir);
    const related: BlogArticle[] = [];
    for (const file of files.filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
      const content = await fs.readFile(path.join(blogDir, file), "utf-8");
      const article = JSON.parse(content) as BlogArticle;
      if (article.slug !== currentSlug && article.category === category) {
        related.push(article);
      }
      if (related.length >= 3) break;
    }
    return related;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
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
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.slug, article.category);
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "Trip and Tick",
      url: "https://www.tripandtick.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Trip and Tick",
      url: "https://www.tripandtick.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.tripandtick.com/blog/${article.slug}`,
    },
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* Article Header */}
        <section className="bg-gradient-to-br from-primary via-[#1A2B6B] to-[#2A1A4A] text-white py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Blog&apos;a Dön
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                {CATEGORY_LABELS[article.category] || article.category}
              </span>
              <span className="text-white/40 text-xs uppercase font-semibold">
                {article.locale.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime} dk okuma
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Trip and Tick
              </span>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <article
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Box */}
          <div className="mt-10 bg-gradient-to-r from-primary to-[#2A1A4A] rounded-2xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Kapadokya&apos;yı Keşfetmeye Hazır mısınız?</h3>
            <p className="text-white/60 text-sm mb-5">
              En uygun fiyatlarla balon turu, aktivite ve otel rezervasyonu yapın.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors"
            >
              Hemen Rezervasyon Yap
            </Link>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-14">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">İlgili Yazılar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-card transition-shadow group"
                  >
                    <h4 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{rel.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
