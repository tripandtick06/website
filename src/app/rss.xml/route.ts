import { ARTICLES } from "@/data/blog";
import { SITE_URL } from "@/lib/schema";

export const runtime = "edge";

// RSS 2.0 feed of the Turkish blog (the canonical, indexable blog locale).
// Endpoint: /rss.xml (outside [locale]: the middleware matcher skips dotted paths).
// Linked from: src/app/[locale]/page.tsx and blog/page.tsx (alternates.types).
// Data: src/data/blog manifest (metadata only) — noindex articles are excluded.

const FEED_TITLE = "Trip and Tick Blog — Kapadokya Seyahat Rehberi";
const FEED_DESC =
  "Kapadokya balon turu, otel tavsiyeleri, aktiviteler, fotoğraf noktaları ve seyahat rehberleri. Trip and Tick editörlüğünden güncel yazılar.";
const MAX_ITEMS = 50;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(iso: string): string {
  const d = new Date(iso);
  return (Number.isNaN(d.getTime()) ? new Date() : d).toUTCString();
}

export function GET(): Response {
  const items = ARTICLES.filter((a) => a.locale === "tr" && !a.noindex)
    .sort((a, b) => (a.updatedAt || a.publishedAt).localeCompare(b.updatedAt || b.publishedAt) * -1)
    .slice(0, MAX_ITEMS);

  const newest = items[0] ? rfc822(items[0].updatedAt || items[0].publishedAt) : new Date().toUTCString();

  const itemsXml = items
    .map((a) => {
      const link = `${SITE_URL}/blog/${a.slug}`;
      return [
        "  <item>",
        `    <title>${escapeXml(a.title)}</title>`,
        `    <link>${link}</link>`,
        `    <guid isPermaLink="true">${link}</guid>`,
        `    <description>${escapeXml(a.excerpt || a.metaDescription || "")}</description>`,
        `    <pubDate>${rfc822(a.publishedAt)}</pubDate>`,
        "    <author>info@tripandtick.com (Trip and Tick Editöryal)</author>",
        ...(a.tags || []).map((t) => `    <category>${escapeXml(t)}</category>`),
        "  </item>",
      ].join("\n");
    })
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `<channel>\n` +
    `  <title>${escapeXml(FEED_TITLE)}</title>\n` +
    `  <link>${SITE_URL}/blog</link>\n` +
    `  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n` +
    `  <description>${escapeXml(FEED_DESC)}</description>\n` +
    `  <language>tr-TR</language>\n` +
    `  <lastBuildDate>${newest}</lastBuildDate>\n` +
    `  <ttl>60</ttl>\n` +
    itemsXml +
    `\n</channel>\n</rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
