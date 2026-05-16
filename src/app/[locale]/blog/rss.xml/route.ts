import fs from "fs/promises";
import path from "path";
import { SITE_URL } from "@/lib/schema";

// RSS 2.0 feed — Trip and Tick Blog.
// Endpoint: /blog/rss.xml
// Reads: src/data/blog/*.json (locale === "tr" only)
// Importers: src/app/blog/page.tsx (metadata.alternates RSS link)
// Format: application/rss+xml, UTF-8, RFC 822 pubDate.

interface BlogArticle {
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  locale: string;
  publishedAt: string;
}

const FEED_TITLE = "Trip and Tick Blog — Kapadokya Seyahat Rehberi";
const FEED_DESC =
  "Kapadokya balon turu, otel tavsiyeleri, aktiviteler, fotoğraf noktaları ve seyahat rehberleri. Trip and Tick blog güncel yazıları.";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string): string {
  try {
    return new Date(iso).toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

async function loadTrArticles(): Promise<BlogArticle[]> {
  const blogDir = path.join(process.cwd(), "src", "data", "blog");
  try {
    const files = await fs.readdir(blogDir);
    const articles: BlogArticle[] = [];
    for (const file of files.filter(
      (f) => f.endsWith(".json") && !f.startsWith("_"),
    )) {
      const raw = await fs.readFile(path.join(blogDir, file), "utf-8");
      const parsed = JSON.parse(raw) as BlogArticle;
      if (parsed.locale === "tr") articles.push(parsed);
    }
    return articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  } catch {
    return [];
  }
}

export async function GET(): Promise<Response> {
  const articles = await loadTrArticles();
  const buildDate = new Date().toUTCString();

  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/blog/${a.slug}`;
      const desc = a.excerpt || a.metaDescription || "";
      const tagsXml = (a.tags || [])
        .map((t) => `    <category>${escapeXml(t)}</category>`)
        .join("\n");
      return [
        "  <item>",
        `    <title>${escapeXml(a.title)}</title>`,
        `    <link>${link}</link>`,
        `    <guid isPermaLink="true">${link}</guid>`,
        `    <description>${escapeXml(desc)}</description>`,
        `    <pubDate>${toRfc822(a.publishedAt)}</pubDate>`,
        tagsXml,
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `<channel>\n` +
    `  <title>${escapeXml(FEED_TITLE)}</title>\n` +
    `  <link>${SITE_URL}/blog</link>\n` +
    `  <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />\n` +
    `  <description>${escapeXml(FEED_DESC)}</description>\n` +
    `  <language>tr-TR</language>\n` +
    `  <lastBuildDate>${buildDate}</lastBuildDate>\n` +
    `  <generator>Trip and Tick — Next.js 14</generator>\n` +
    `  <ttl>60</ttl>\n` +
    items +
    `\n</channel>\n` +
    `</rss>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
