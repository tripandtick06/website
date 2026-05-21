"use client";

// CLIENT component — i18n chrome strings via useT().
// Article content (title, body, excerpt, tags) comes from src/data/blog — NOT translated.
// NEW KEYS (not in dict yet, pending dict update):
//   page.blog.category_balon_turlari = "Balon Turları"
//   page.blog.category_kapadokya_rehber = "Kapadokya Rehberi"
//   page.blog.category_aktiviteler = "Aktiviteler"
//   page.blog.category_konaklama = "Konaklama"
//   page.blog.category_ulasim = "Ulaşım"
//   page.blog.category_genel = "Genel"

import { ArrowLeft, Calendar, Tag, User, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";
import type { BlogArticle } from "@/data/blog";

// NEW KEYS — pending dict addition. TR fallback used until dict is updated.
function getCategoryLabel(
  cat: string,
  blogDict: Record<string, unknown>
): string {
  const key = `category_${cat.replace(/-/g, "_")}`;
  return typeof blogDict[key] === "string" ? (blogDict[key] as string) : cat;
}

interface BlogArticleContentProps {
  article: BlogArticle;
  related: BlogArticle[];
  readTime: number;
  renderedContent: string;
}

export function BlogArticleContent({
  article,
  related,
  readTime,
  renderedContent,
}: BlogArticleContentProps) {
  const t = useT();
  const slugDict = t.page.blog.slug;
  const blogDict = t.page.blog as unknown as Record<string, unknown>;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Article Header */}
      <section className="bg-gradient-to-br from-primary via-[#1A2B6B] to-[#2A1A4A] text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {slugDict.blog_don}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
              {getCategoryLabel(article.category, blogDict)}
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
              {readTime} {slugDict.dk_okuma}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {slugDict.trip_tick}
            </span>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <article
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
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
          <h3 className="text-xl font-bold mb-2">
            {slugDict.kapadokya_yi_kesfetmeye_hazir}
          </h3>
          <p className="text-white/60 text-sm mb-5">
            {slugDict.en_uygun_fiyatlarla_balon_turu}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors"
          >
            {slugDict.hemen_rezervasyon_yap}
          </Link>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6">
              {slugDict.ilgili_yazilar}
            </h3>
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
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {rel.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
