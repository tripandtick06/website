"use client";

// CLIENT component — i18n chrome strings via useT().
// Article data (titles, excerpts, content) come from src/data/blog — NOT translated.
// NEW KEYS (not in dict yet, pending dict update):
//   page.blog.category_balon_turlari = "Balon Turları"
//   page.blog.category_kapadokya_rehber = "Kapadokya Rehberi"
//   page.blog.category_aktiviteler = "Aktiviteler"
//   page.blog.category_konaklama = "Konaklama"
//   page.blog.category_ulasim = "Ulaşım"
//   page.blog.category_genel = "Genel"

import NextImage from "next/image";
import { ArrowRight, Calendar, Tag, Search } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";
import type { BlogArticleMeta } from "@/data/blog";

// CATEGORY_COLORS stays here (purely visual, no translation needed)
const CATEGORY_COLORS: Record<string, string> = {
  "balon-turlari": "bg-accent/10 text-accent",
  "kapadokya-rehber": "bg-primary/10 text-primary",
  aktiviteler: "bg-success/10 text-success",
  konaklama: "bg-warning/10 text-warning",
  ulasim: "bg-danger/10 text-danger",
  genel: "bg-slate-100 text-slate-600",
};

// NEW KEYS — pending dict addition. TR fallback used until dict is updated.
// These are module-level so they're NOT called as a hook inside map().
function getCategoryLabel(
  cat: string,
  blogDict: Record<string, unknown>
): string {
  const key = `category_${cat.replace(/-/g, "_")}`;
  return typeof blogDict[key] === "string" ? (blogDict[key] as string) : cat;
}

interface BlogContentProps {
  articles: BlogArticleMeta[];
}

export function BlogContent({ articles }: BlogContentProps) {
  const t = useT();
  const blog = t.page.blog;
  const blogDict = blog as unknown as Record<string, unknown>;

  // Derive categories client-side (same logic as server original)
  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-[#1A2B6B] to-[#2A1A4A] text-white py-16 sm:py-20">
        <div className="container-main text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-wider uppercase mb-4">
            {blog.blog_rehber}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            {blog.kapadokya_seyahat}{" "}
            <span className="text-accent">Rehberi</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {blog.balon_turlari_gezi_rotalari_otel}
          </p>
        </div>
      </section>

      <div className="container-main py-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <span className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold cursor-pointer">
              {blog.tumu}
              {articles.length})
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                  CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-600"
                } hover:opacity-80`}
              >
                {getCategoryLabel(cat, blogDict)} (
                {articles.filter((a) => a.category === cat).length})
              </span>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={`${article.locale}-${article.slug}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-card transition-shadow group"
              >
                {/* Cover foto */}
                <Link
                  href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
                  className="block relative h-44 bg-slate-100 overflow-hidden"
                >
                  <NextImage
                    src={article.coverImage || "/images/hero/homepage.jpg"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out-strong group-hover:scale-105"
                  />
                </Link>

                {/* Category & Locale Badge */}
                <div className="px-6 pt-6 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[article.category] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getCategoryLabel(article.category, blogDict)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                    {article.locale.toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <Link href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}>
                    <h2 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt || article.metaDescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(article.publishedAt).toLocaleDateString(
                        "tr-TR",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <Link
                      href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors"
                    >
                      {blog.devamini_oku}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {blog.henuz_blog_yazisi_yok}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {blog.seo_agent_yakinda_kapadokya}
            </p>
          </div>
        )}

        {/* SEO Content Block */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            {blog.kapadokya_hakkinda_her_sey}
          </h2>
          <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed">
            <p>{blog.kapadokya_turkiye_nin_nevsehir}</p>
            <p>{blog.trip_tick_olarak_kapadokya_daki}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
