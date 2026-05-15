import { ArrowRight, Calendar, Tag, Search } from "lucide-react";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";

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

const CATEGORY_COLORS: Record<string, string> = {
  "balon-turlari": "bg-accent/10 text-accent",
  "kapadokya-rehber": "bg-primary/10 text-primary",
  "aktiviteler": "bg-success/10 text-success",
  "konaklama": "bg-warning/10 text-warning",
  "ulasim": "bg-danger/10 text-danger",
  "genel": "bg-slate-100 text-slate-600",
};

async function getBlogArticles(): Promise<BlogArticle[]> {
  const blogDir = path.join(process.cwd(), "src", "data", "blog");
  try {
    const files = await fs.readdir(blogDir);
    const articles: BlogArticle[] = [];
    for (const file of files.filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
      const content = await fs.readFile(path.join(blogDir, file), "utf-8");
      articles.push(JSON.parse(content));
    }
    return articles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Blog — Kapadokya Seyahat Rehberi | Trip and Tick",
  description:
    "Kapadokya balon turu, gezi rehberi, aktiviteler ve otel tavsiyeleri hakkında en güncel blog yazıları. Fiyatlar, ipuçları ve deneyimler.",
};

export default async function BlogPage() {
  const articles = await getBlogArticles();
  const trArticles = articles.filter((a) => a.locale === "tr");
  const enArticles = articles.filter((a) => a.locale === "en");

  // Group by category
  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-[#1A2B6B] to-[#2A1A4A] text-white py-16 sm:py-20">
        <div className="container-main text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-wider uppercase mb-4">
            Blog & Rehber
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Kapadokya Seyahat <span className="text-accent">Rehberi</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Balon turları, gezi rotaları, otel tavsiyeleri ve daha fazlası.
            Kapadokya seyahatiniz için ihtiyacınız olan her şey burada.
          </p>
        </div>
      </section>

      <div className="container-main py-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <span className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold cursor-pointer">
              Tümü ({articles.length})
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                  CATEGORY_COLORS[cat] || "bg-slate-100 text-slate-600"
                } hover:opacity-80`}
              >
                {CATEGORY_LABELS[cat] || cat} ({articles.filter((a) => a.category === cat).length})
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
                {/* Category & Locale Badge */}
                <div className="px-6 pt-6 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[article.category] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {CATEGORY_LABELS[article.category] || article.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                    {article.locale.toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <Link href={`/blog/${article.slug}`}>
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
                      {new Date(article.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors"
                    >
                      Devamını Oku
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz Blog Yazısı Yok</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              SEO Agent yakında Kapadokya seyahati hakkında faydalı blog yazıları oluşturacak.
              Tekrar kontrol edin!
            </p>
          </div>
        )}

        {/* SEO Content Block */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            Kapadokya Hakkında Her Şey
          </h2>
          <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed">
            <p>
              Kapadokya, Türkiye&apos;nin Nevşehir ilinde yer alan UNESCO Dünya Mirası listesindeki
              eşsiz bir bölgedir. Peri bacaları, yer altı şehirleri ve sıcak hava balon turlarıyla
              dünya genelinde tanınan Kapadokya, her yıl milyonlarca turisti ağırlamaktadır.
            </p>
            <p>
              Trip and Tick olarak, Kapadokya&apos;daki en güvenilir operatörlerle çalışarak size en
              uygun fiyatlarla unutulmaz deneyimler sunuyoruz. 9+ anlaşmalı balon operatörü, en düşük
              fiyat garantisi ve %100 hava iptali iade politikamızla güvenle rezervasyon yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
