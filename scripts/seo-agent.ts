/**
 * Trip and Tick — SEO Agent
 *
 * Bu script Claude AI kullanarak günlük olarak:
 * 1. Google'da trend olan Kapadokya ile ilgili anahtar kelimeleri araştırır
 * 2. Yeni blog makaleleri oluşturur (TR + EN)
 * 3. Meta etiketlerini optimize eder
 * 4. İç linkler önerir
 * 5. Mevcut içerikleri günceller
 *
 * Kullanım:
 *   npx tsx scripts/seo-agent.ts             # Manuel çalıştırma
 *   npx tsx scripts/seo-agent.ts --daily     # Günlük otomasyon modu
 *   npx tsx scripts/seo-agent.ts --audit     # Mevcut içerik denetimi
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

// ── Configuration ──

const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  model: "claude-sonnet-4-20250514",
  blogDir: path.join(process.cwd(), "src", "data", "blog"),
  locales: ["tr", "en"] as const,
  maxArticlesPerRun: 2,
  categories: [
    "balon-turlari",
    "kapadokya-rehber",
    "aktiviteler",
    "konaklama",
    "ulasim",
    "genel",
  ],
  targetKeywords: {
    tr: [
      "kapadokya balon turu fiyat 2026",
      "kapadokya balon rezervasyon",
      "kapadokya en ucuz balon turu",
      "kapadokya atv turu fiyat",
      "kapadokya at binme turu",
      "kapadokya otel tavsiye",
      "kapadokya gezi rehberi",
      "kapadokya hava durumu balon iptal",
      "kapadokya balon çocuk yaş sınırı",
      "kapadokya mağara otel",
      "göreme açık hava müzesi",
      "ihlara vadisi turu",
      "kapadokya doğu ekspresi",
      "kapadokya fotoğraf noktaları",
      "kapadokya ne zaman gidilir",
    ],
    en: [
      "cappadocia hot air balloon price 2026",
      "cappadocia balloon tour booking",
      "cheapest cappadocia balloon ride",
      "cappadocia atv tour",
      "cappadocia horse riding tour",
      "best cave hotels cappadocia",
      "cappadocia travel guide",
      "cappadocia weather balloon cancellation",
      "cappadocia balloon age limit",
      "cappadocia things to do",
      "goreme open air museum",
      "ihlara valley tour",
      "cappadocia photography spots",
      "best time to visit cappadocia",
      "cappadocia honeymoon packages",
    ],
  },
};

// ── Types ──

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
  isAiGenerated: boolean;
  seoScore: number;
}

interface SEOAuditResult {
  file: string;
  issues: string[];
  suggestions: string[];
  score: number;
}

interface AgentLog {
  timestamp: string;
  action: string;
  details: string;
  success: boolean;
}

// ── Claude Client ──

const anthropic = new Anthropic({ apiKey: CONFIG.anthropicApiKey });

async function askClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: CONFIG.model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

// ── Blog Article Generator ──

async function generateBlogArticle(
  keyword: string,
  locale: "tr" | "en"
): Promise<BlogArticle> {
  const systemPrompt = `Sen Trip and Tick seyahat acentası için profesyonel SEO içerik yazarısın.

Şirket Bilgisi:
- Trip and Tick, Kapadokya merkezli online seyahat acentasıdır
- Balon turları, ATV, at binme, gezi turları, otel ve transfer hizmetleri sunar
- 9+ anlaşmalı balon operatörü ile çalışır
- En düşük fiyat garantisi sunar
- Merkez: Göreme/Nevşehir, Kapadokya, Türkiye
- Site: tripandtick.com

SEO Kuralları:
- Hedef anahtar kelimeyi başlıkta, ilk paragrafta ve H2 başlıklarında kullan
- Meta description 150-160 karakter
- İlk paragraf Featured Snippet (Position 0) için optimize edilmeli (40-60 kelime, soruya direkt yanıt)
- İç linkler ekle: /balonlar, /aktiviteler, /turlar, /oteller, /paketler
- Minimum 1500 kelime
- H2 ve H3 başlıkları kullan
- SSS bölümü ekle (FAQPage schema için)
- Doğal dil kullan, keyword stuffing yapma
- Dil: ${locale === "tr" ? "Türkçe" : "English"}`;

  const userPrompt = `"${keyword}" anahtar kelimesi için SEO-optimize edilmiş bir blog makalesi yaz.

Yanıtını aşağıdaki JSON formatında ver (sadece JSON, başka bir şey yazma):

{
  "slug": "url-uyumlu-slug",
  "title": "Makale Başlığı (60-65 karakter)",
  "metaTitle": "SEO Meta Title (55-60 karakter)",
  "metaDescription": "Meta description (150-160 karakter)",
  "excerpt": "Kısa özet (200 karakter)",
  "content": "Tam makale içeriği (Markdown formatında, H2/H3 başlıklarıyla)",
  "category": "${CONFIG.categories.join(" | ")} kategorilerinden biri",
  "tags": ["etiket1", "etiket2", "etiket3"],
  "targetKeyword": "${keyword}",
  "seoScore": 85
}`;

  const response = await askClaude(systemPrompt, userPrompt);

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON bulunamadı");

    const article = JSON.parse(jsonMatch[0]) as Partial<BlogArticle>;

    return {
      slug: article.slug || keyword.replace(/\s+/g, "-").toLowerCase(),
      title: article.title || keyword,
      metaTitle: article.metaTitle || article.title || keyword,
      metaDescription: article.metaDescription || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      category: article.category || "genel",
      tags: article.tags || [],
      targetKeyword: keyword,
      locale,
      publishedAt: new Date().toISOString(),
      isAiGenerated: true,
      seoScore: article.seoScore || 80,
    };
  } catch (error) {
    console.error("Article parsing error:", error);
    throw error;
  }
}

// ── SEO Audit ──

async function auditExistingContent(): Promise<SEOAuditResult[]> {
  const results: SEOAuditResult[] = [];

  try {
    const files = await fs.readdir(CONFIG.blogDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(CONFIG.blogDir, file), "utf-8");
      const article = JSON.parse(content) as BlogArticle;

      const issues: string[] = [];
      const suggestions: string[] = [];
      let score = 100;

      // Title length check
      if (article.title.length < 30) {
        issues.push("Başlık çok kısa (minimum 30 karakter)");
        score -= 10;
      }
      if (article.title.length > 70) {
        issues.push("Başlık çok uzun (maksimum 70 karakter)");
        score -= 5;
      }

      // Meta description check
      if (!article.metaDescription) {
        issues.push("Meta description eksik");
        score -= 15;
      } else if (article.metaDescription.length < 120 || article.metaDescription.length > 165) {
        issues.push("Meta description ideal uzunlukta değil (120-165 karakter)");
        score -= 5;
      }

      // Content length check
      const wordCount = article.content.split(/\s+/).length;
      if (wordCount < 800) {
        issues.push(`İçerik çok kısa (${wordCount} kelime, minimum 800)"`);
        score -= 15;
      }

      // H2 headings check
      const h2Count = (article.content.match(/^## /gm) || []).length;
      if (h2Count < 3) {
        issues.push("Yetersiz H2 başlık (minimum 3)");
        suggestions.push("Daha fazla H2 alt başlık ekleyin");
        score -= 10;
      }

      // Internal links check
      const internalLinks = (article.content.match(/\]\(\//g) || []).length;
      if (internalLinks < 2) {
        suggestions.push("Daha fazla iç link ekleyin (/balonlar, /turlar vb.)");
        score -= 5;
      }

      // FAQ section check
      const hasFAQ = article.content.toLowerCase().includes("sık sorulan") ||
                     article.content.toLowerCase().includes("frequently asked");
      if (!hasFAQ) {
        suggestions.push("SSS bölümü ekleyin (Featured Snippet için)");
        score -= 5;
      }

      // Age of article check
      const publishDate = new Date(article.publishedAt);
      const daysSincePublish = Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSincePublish > 90) {
        suggestions.push(`Makale ${daysSincePublish} gün önce yayınlandı. Güncelleme önerilir.`);
        score -= 5;
      }

      results.push({ file, issues, suggestions, score: Math.max(0, score) });
    }
  } catch (error) {
    // Blog directory might not exist yet
    console.log("Blog dizini henüz oluşturulmamış veya boş.");
  }

  return results;
}

// ── Keyword Research (Claude-powered) ──

async function researchTrendingKeywords(locale: "tr" | "en"): Promise<string[]> {
  const response = await askClaude(
    `Sen bir SEO uzmanısın. Kapadokya turizmi konusunda güncel trend anahtar kelimeleri biliyorsun.`,
    `${locale === "tr" ? "Türkçe" : "İngilizce"} olarak Kapadokya turizmiyle ilgili şu an trend olan,
    henüz çok rekabetçi olmayan ama arama hacmi olan 5 anahtar kelime öner.

    Mevcut hedef kelimelerimiz: ${CONFIG.targetKeywords[locale].join(", ")}

    Bunlardan FARKLI, yeni fırsatlar sunan kelimeler öner.

    Sadece bir JSON array döndür, başka bir şey yazma:
    ["anahtar kelime 1", "anahtar kelime 2", ...]`
  );

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return [];
}

// ── Content Updater (refresh old articles) ──

async function refreshArticle(article: BlogArticle): Promise<BlogArticle> {
  const response = await askClaude(
    `Sen Trip and Tick için SEO editörüsün. Mevcut bir makaleyi güncelleyeceksin.
    Kurallar: Yeni bilgiler ekle, tarihleri güncelle, SEO skorunu yükselt, iç link ekle.`,
    `Bu makaleyi güncelle ve SEO skorunu artır:

    Başlık: ${article.title}
    Hedef Kelime: ${article.targetKeyword}
    Mevcut İçerik (kısaltılmış): ${article.content.substring(0, 1500)}

    Sadece güncellenmiş content alanını Markdown olarak döndür.`
  );

  return {
    ...article,
    content: response || article.content,
    publishedAt: new Date().toISOString(),
    seoScore: Math.min(100, article.seoScore + 5),
  };
}

// ── Internal Link Suggester ──

async function suggestInternalLinks(articles: BlogArticle[]): Promise<Record<string, string[]>> {
  const titles = articles.map((a) => `[${a.slug}] ${a.title}`).join("\n");

  const response = await askClaude(
    "Sen SEO uzmanısın. Makaleler arasında iç link stratejisi öner.",
    `Aşağıdaki makaleler arasında hangi iç linkleri eklemeliyiz? Her makale için 2-3 link öner.

    Makaleler:
    ${titles}

    Sayfa linkleri: /balonlar, /aktiviteler, /turlar, /oteller, /paketler, /transferler

    JSON formatında yanıt ver:
    {"makale-slug": ["link1", "link2"]}`
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return {};
}

// ── File Operations ──

async function ensureBlogDir() {
  await fs.mkdir(CONFIG.blogDir, { recursive: true });
}

async function saveArticle(article: BlogArticle) {
  await ensureBlogDir();
  const filename = `${article.locale}-${article.slug}.json`;
  const filepath = path.join(CONFIG.blogDir, filename);
  await fs.writeFile(filepath, JSON.stringify(article, null, 2), "utf-8");
  return filepath;
}

async function loadExistingArticles(): Promise<BlogArticle[]> {
  try {
    const files = await fs.readdir(CONFIG.blogDir);
    const articles: BlogArticle[] = [];
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      const content = await fs.readFile(path.join(CONFIG.blogDir, file), "utf-8");
      articles.push(JSON.parse(content));
    }
    return articles;
  } catch {
    return [];
  }
}

async function saveLog(logs: AgentLog[]) {
  const logDir = path.join(process.cwd(), "scripts", "logs");
  await fs.mkdir(logDir, { recursive: true });
  const date = new Date().toISOString().split("T")[0];
  const filepath = path.join(logDir, `seo-agent-${date}.json`);
  await fs.writeFile(filepath, JSON.stringify(logs, null, 2), "utf-8");
}

// ── Main Agent Execution ──

async function runSEOAgent(mode: "daily" | "manual" | "audit" = "daily") {
  const logs: AgentLog[] = [];
  const log = (action: string, details: string, success = true) => {
    const entry = { timestamp: new Date().toISOString(), action, details, success };
    logs.push(entry);
    console.log(`${success ? "✓" : "✗"} [${action}] ${details}`);
  };

  console.log("\n══════════════════════════════════════");
  console.log("  Trip and Tick — SEO Agent");
  console.log(`  Mod: ${mode} | ${new Date().toLocaleString("tr-TR")}`);
  console.log("══════════════════════════════════════\n");

  // ─ Step 1: Audit existing content
  log("AUDIT", "Mevcut içerik denetimi başlatılıyor...");
  const auditResults = await auditExistingContent();
  for (const result of auditResults) {
    if (result.issues.length > 0) {
      log("AUDIT", `${result.file}: ${result.issues.length} sorun bulundu (Skor: ${result.score})`);
    }
  }
  log("AUDIT", `Toplam ${auditResults.length} makale denetlendi.`);

  if (mode === "audit") {
    console.log("\n── Denetim Raporu ──");
    for (const r of auditResults) {
      console.log(`\n📄 ${r.file} (Skor: ${r.score}/100)`);
      r.issues.forEach((i) => console.log(`  ⚠️  ${i}`));
      r.suggestions.forEach((s) => console.log(`  💡 ${s}`));
    }
    await saveLog(logs);
    return;
  }

  // ─ Step 2: Research trending keywords
  log("RESEARCH", "Trend anahtar kelimeler araştırılıyor...");
  const newKeywordsTR = await researchTrendingKeywords("tr");
  const newKeywordsEN = await researchTrendingKeywords("en");
  log("RESEARCH", `TR: ${newKeywordsTR.length} yeni kelime, EN: ${newKeywordsEN.length} yeni kelime`);

  // ─ Step 3: Select keywords for new articles
  const existingArticles = await loadExistingArticles();
  const existingSlugs = new Set(existingArticles.map((a) => a.slug));

  // Pick keywords that don't have articles yet
  const allKeywordsTR = [...CONFIG.targetKeywords.tr, ...newKeywordsTR];
  const allKeywordsEN = [...CONFIG.targetKeywords.en, ...newKeywordsEN];

  const unusedTR = allKeywordsTR.filter(
    (kw) => !existingArticles.some((a) => a.targetKeyword === kw && a.locale === "tr")
  );
  const unusedEN = allKeywordsEN.filter(
    (kw) => !existingArticles.some((a) => a.targetKeyword === kw && a.locale === "en")
  );

  // ─ Step 4: Generate new articles
  const articlesToGenerate = Math.min(CONFIG.maxArticlesPerRun, unusedTR.length + unusedEN.length);
  log("GENERATE", `${articlesToGenerate} yeni makale oluşturulacak...`);

  let generated = 0;

  // Generate TR articles
  for (const keyword of unusedTR.slice(0, Math.ceil(CONFIG.maxArticlesPerRun / 2))) {
    try {
      log("GENERATE", `TR makale oluşturuluyor: "${keyword}"`);
      const article = await generateBlogArticle(keyword, "tr");
      const filepath = await saveArticle(article);
      log("GENERATE", `Kaydedildi: ${filepath} (SEO Skor: ${article.seoScore})`, true);
      generated++;
    } catch (error) {
      log("GENERATE", `Hata: ${keyword} — ${error}`, false);
    }
  }

  // Generate EN articles
  for (const keyword of unusedEN.slice(0, Math.floor(CONFIG.maxArticlesPerRun / 2))) {
    try {
      log("GENERATE", `EN makale oluşturuluyor: "${keyword}"`);
      const article = await generateBlogArticle(keyword, "en");
      const filepath = await saveArticle(article);
      log("GENERATE", `Kaydedildi: ${filepath} (SEO Skor: ${article.seoScore})`, true);
      generated++;
    } catch (error) {
      log("GENERATE", `Hata: ${keyword} — ${error}`, false);
    }
  }

  // ─ Step 5: Refresh old articles (if any need updating)
  const oldArticles = existingArticles.filter((a) => {
    const days = Math.floor((Date.now() - new Date(a.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days > 60 && a.seoScore < 90;
  });

  if (oldArticles.length > 0) {
    log("REFRESH", `${oldArticles.length} eski makale güncelleniyor...`);
    const articleToRefresh = oldArticles[0]; // Refresh one per run
    try {
      const refreshed = await refreshArticle(articleToRefresh);
      await saveArticle(refreshed);
      log("REFRESH", `Güncellendi: ${articleToRefresh.slug}`);
    } catch (error) {
      log("REFRESH", `Hata: ${error}`, false);
    }
  }

  // ─ Step 6: Suggest internal links
  const allArticles = await loadExistingArticles();
  if (allArticles.length >= 3) {
    log("LINKS", "İç link önerileri oluşturuluyor...");
    const linkSuggestions = await suggestInternalLinks(allArticles);
    const linkCount = Object.values(linkSuggestions).flat().length;
    log("LINKS", `${linkCount} iç link önerisi oluşturuldu.`);

    // Save link suggestions
    const linkPath = path.join(CONFIG.blogDir, "_internal-links.json");
    await fs.writeFile(linkPath, JSON.stringify(linkSuggestions, null, 2));
  }

  // ─ Summary
  console.log("\n══════════════════════════════════════");
  console.log("  Özet:");
  console.log(`  📝 ${generated} yeni makale oluşturuldu`);
  console.log(`  🔍 ${auditResults.length} makale denetlendi`);
  console.log(`  🔄 ${oldArticles.length > 0 ? 1 : 0} makale güncellendi`);
  console.log(`  📊 Toplam makale: ${allArticles.length}`);
  console.log("══════════════════════════════════════\n");

  await saveLog(logs);
}

// ── CLI Entry Point ──

const args = process.argv.slice(2);
const mode = args.includes("--audit")
  ? "audit"
  : args.includes("--daily")
    ? "daily"
    : "manual";

runSEOAgent(mode).catch((error) => {
  console.error("SEO Agent hatası:", error);
  process.exit(1);
});
