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

import NextImage from "next/image";
import { ArrowLeft, Calendar, Tag, User, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";
import type { BlogArticle, BlogArticleMeta } from "@/data/blog";

// NEW KEYS — pending dict addition. TR fallback used until dict is updated.
function getCategoryLabel(
  cat: string,
  blogDict: Record<string, unknown>
): string {
  const key = `category_${cat.replace(/-/g, "_")}`;
  return typeof blogDict[key] === "string" ? (blogDict[key] as string) : cat;
}

// Internal linking (2026-09-16 audit): route the article's category into one
// relevant money page. Order matters — first match wins.
function getCategoryServiceLink(
  category: string,
  t: ReturnType<typeof useT>
): { href: "/oteller" | "/turlar" | "/transferler" | "/kapadokya"; label: string } {
  const cat = category.toLowerCase();
  if (cat.includes("konaklama") || cat.includes("otel") || cat.includes("hotel")) {
    return { href: "/oteller", label: t.nav.hotels };
  }
  if (cat.includes("tur") || cat.includes("aktivite")) {
    return { href: "/turlar", label: t.nav.tours };
  }
  if (cat.includes("transfer") || cat.includes("ulaşım") || cat.includes("ulasim") || cat.includes("istanbul")) {
    return { href: "/transferler", label: t.nav_extra.transfers };
  }
  return { href: "/kapadokya", label: t.nav_extra.kapadokya_guide };
}

interface BlogArticleContentProps {
  article: BlogArticle;
  related: BlogArticleMeta[];
  readTime: number;
  renderedContent: string;
}

// Sıkça sorulan sorular başlığı — 17 dil (sözlük churn'ü yerine yerel harita).
const FAQ_HEADING: Record<string, string> = {
  tr: "Sıkça Sorulan Sorular", en: "Frequently Asked Questions", de: "Häufig gestellte Fragen",
  fr: "Questions fréquentes", es: "Preguntas frecuentes", nl: "Veelgestelde vragen", zh: "常见问题",
  hi: "अक्सर पूछे जाने वाले प्रश्न", ur: "اکثر پوچھے گئے سوالات", pt: "Perguntas frequentes",
  "pt-BR": "Perguntas frequentes", ja: "よくある質問", ko: "자주 묻는 질문", it: "Domande frequenti",
  ru: "Часто задаваемые вопросы", uk: "Часті запитання", az: "Tez-tez verilən suallar",
};

export function BlogArticleContent({
  article,
  related,
  readTime,
  renderedContent,
}: BlogArticleContentProps) {
  const t = useT();
  const slugDict = t.page.blog.slug;
  const blogDict = t.page.blog as unknown as Record<string, unknown>;
  const categoryLink = getCategoryServiceLink(article.category, t);
  const relatedServiceLinks = [
    { href: "/balonlar" as const, label: t.nav.balloons },
    { href: "/balonlar/bugun-ucuyor-mu" as const, label: t.nav_extra.flying_today },
    categoryLink,
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Article Header — konuyla ilgili cover foto + koyu gradient overlay */}
      <section className="relative overflow-hidden text-white py-12 sm:py-16">
        <NextImage
          src={article.coverImage || "/images/hero/homepage.jpg"}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-[#1A2B6B]/85 to-[#2A1A4A]/90" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
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

        {/* FAQ — JSON-LD ile aynı liste (page.tsx faqPageSchema); görünür olmalı. */}
        {article.faq && article.faq.length > 0 && (
          <section className="mt-10 pt-6 border-t border-slate-200" aria-labelledby="blog-faq-heading">
            <h2 id="blog-faq-heading" className="text-2xl font-extrabold text-slate-900 mb-4">
              {FAQ_HEADING[article.locale] ?? FAQ_HEADING.en}
            </h2>
            <dl className="space-y-4">
              {article.faq.map((f) => (
                <div key={f.question} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="font-bold text-slate-900">{f.question}</dt>
                  <dd className="mt-1 text-slate-700 leading-relaxed speakable">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

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

        {/* Related services */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedServiceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center hover:shadow-card hover:border-primary/30 transition-all"
            >
              <span className="text-sm font-bold text-slate-900">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* CTA Box */}
        <div className="mt-6 bg-gradient-to-r from-primary to-[#2A1A4A] rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            {slugDict.kapadokya_yi_kesfetmeye_hazir}
          </h3>
          <p className="text-white/60 text-sm mb-5">
            {slugDict.en_uygun_fiyatlarla_balon_turu}
          </p>
          <Link
            href="/balonlar"
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
                  href={{ pathname: "/blog/[slug]", params: { slug: rel.slug } }}
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
