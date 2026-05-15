/**
 * SEO Agent API Route
 *
 * POST /api/seo-agent
 *   Body: { mode: "daily" | "manual" | "audit", secret: string }
 *
 * Güvenlik: CRON_SECRET env değişkeni ile korunur.
 * Vercel Cron veya harici scheduler bu endpoint'i çağırabilir.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

// ── Config ──

const CRON_SECRET = process.env.CRON_SECRET || "tripandtick-seo-2026";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const BLOG_DIR = path.join(process.cwd(), "src", "data", "blog");
const MODEL = "claude-sonnet-4-20250514";

const CATEGORIES = [
  "balon-turlari",
  "kapadokya-rehber",
  "aktiviteler",
  "konaklama",
  "ulasim",
  "genel",
];

const TARGET_KEYWORDS = {
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

// ── Claude Client ──

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

async function askClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

// ── Core Functions ──

async function ensureBlogDir() {
  await fs.mkdir(BLOG_DIR, { recursive: true });
}

async function loadExistingArticles(): Promise<BlogArticle[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const articles: BlogArticle[] = [];
    for (const file of files.filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
      const content = await fs.readFile(path.join(BLOG_DIR, file), "utf-8");
      articles.push(JSON.parse(content));
    }
    return articles;
  } catch {
    return [];
  }
}

async function saveArticle(article: BlogArticle): Promise<string> {
  await ensureBlogDir();
  const filename = `${article.locale}-${article.slug}.json`;
  const filepath = path.join(BLOG_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(article, null, 2), "utf-8");
  return filename;
}

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
- Site: tripandtick.com

SEO Kuralları:
- Hedef anahtar kelimeyi başlıkta, ilk paragrafta ve H2 başlıklarında kullan
- Meta description 150-160 karakter
- İlk paragraf Featured Snippet (Position 0) için optimize edilmeli
- İç linkler ekle: /balonlar, /aktiviteler, /turlar, /oteller, /paketler
- Minimum 1500 kelime
- SSS bölümü ekle
- Dil: ${locale === "tr" ? "Türkçe" : "English"}`;

  const userPrompt = `"${keyword}" anahtar kelimesi için SEO-optimize edilmiş bir blog makalesi yaz.

Yanıtını aşağıdaki JSON formatında ver (sadece JSON):
{
  "slug": "url-uyumlu-slug",
  "title": "Makale Başlığı (60-65 karakter)",
  "metaTitle": "SEO Meta Title (55-60 karakter)",
  "metaDescription": "Meta description (150-160 karakter)",
  "excerpt": "Kısa özet (200 karakter)",
  "content": "Tam makale içeriği (Markdown formatında)",
  "category": "${CATEGORIES.join(" | ")} kategorilerinden biri",
  "tags": ["etiket1", "etiket2", "etiket3"],
  "targetKeyword": "${keyword}",
  "seoScore": 85
}`;

  const response = await askClaude(systemPrompt, userPrompt);

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
}

async function auditArticles(): Promise<{
  total: number;
  issues: { file: string; problems: string[]; score: number }[];
}> {
  const articles = await loadExistingArticles();
  const issues: { file: string; problems: string[]; score: number }[] = [];

  for (const article of articles) {
    const problems: string[] = [];
    let score = 100;

    if (article.title.length < 30) { problems.push("Başlık çok kısa"); score -= 10; }
    if (article.title.length > 70) { problems.push("Başlık çok uzun"); score -= 5; }
    if (!article.metaDescription) { problems.push("Meta description eksik"); score -= 15; }
    if (article.content.split(/\s+/).length < 800) { problems.push("İçerik çok kısa"); score -= 15; }
    if ((article.content.match(/^## /gm) || []).length < 3) { problems.push("Yetersiz H2 başlık"); score -= 10; }

    if (problems.length > 0) {
      issues.push({ file: `${article.locale}-${article.slug}`, problems, score: Math.max(0, score) });
    }
  }

  return { total: articles.length, issues };
}

// ── Route Handler ──

export async function POST(request: NextRequest) {
  try {
    // Support both JSON body and Vercel Cron header auth
    let mode = "daily";
    let authorized = false;

    // Check Vercel Cron auth header
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${CRON_SECRET}`) {
      authorized = true;
    }

    // Check JSON body auth
    try {
      const body = await request.json();
      if (body.secret === CRON_SECRET) authorized = true;
      if (body.mode) mode = body.mode;
    } catch {
      // No JSON body (Vercel Cron calls with empty body)
    }

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const results: { action: string; detail: string }[] = [];

    if (mode === "audit") {
      const audit = await auditArticles();
      return NextResponse.json({
        success: true,
        mode: "audit",
        total: audit.total,
        issues: audit.issues,
      });
    }

    // Daily / manual mode — generate articles
    const existingArticles = await loadExistingArticles();

    const unusedTR = TARGET_KEYWORDS.tr.filter(
      (kw) => !existingArticles.some((a) => a.targetKeyword === kw && a.locale === "tr")
    );
    const unusedEN = TARGET_KEYWORDS.en.filter(
      (kw) => !existingArticles.some((a) => a.targetKeyword === kw && a.locale === "en")
    );

    let generated = 0;

    // Generate 1 TR article
    if (unusedTR.length > 0) {
      try {
        const article = await generateBlogArticle(unusedTR[0], "tr");
        const file = await saveArticle(article);
        results.push({ action: "generate", detail: `TR: ${file} (Score: ${article.seoScore})` });
        generated++;
      } catch (err) {
        results.push({ action: "error", detail: `TR generation failed: ${err}` });
      }
    }

    // Generate 1 EN article
    if (unusedEN.length > 0) {
      try {
        const article = await generateBlogArticle(unusedEN[0], "en");
        const file = await saveArticle(article);
        results.push({ action: "generate", detail: `EN: ${file} (Score: ${article.seoScore})` });
        generated++;
      } catch (err) {
        results.push({ action: "error", detail: `EN generation failed: ${err}` });
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      generated,
      totalArticles: existingArticles.length + generated,
      remainingKeywords: { tr: unusedTR.length - (generated > 0 ? 1 : 0), en: unusedEN.length - (generated > 1 ? 1 : 0) },
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for health check / status
export async function GET() {
  try {
    const articles = await loadExistingArticles();
    const trCount = articles.filter((a) => a.locale === "tr").length;
    const enCount = articles.filter((a) => a.locale === "en").length;

    return NextResponse.json({
      status: "active",
      totalArticles: articles.length,
      breakdown: { tr: trCount, en: enCount },
      targetKeywords: { tr: TARGET_KEYWORDS.tr.length, en: TARGET_KEYWORDS.en.length },
      lastArticle: articles.length > 0
        ? articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0].publishedAt
        : null,
    });
  } catch {
    return NextResponse.json({ status: "active", totalArticles: 0 });
  }
}
