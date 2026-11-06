// GEO citation standard (S1-S12 subset) for English blog articles.
// Ratchet: pages listed in MUST_PASS are enforced; add pages only after they meet the standard.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import SOURCES from "@/data/sources.json";
import { ARTICLES } from "@/data/blog";

const ROOT = path.resolve(__dirname, "../..");
const MUST_PASS = [
  "en-cappadocia-hot-air-balloon-price-2026.json",
  "en-kapadokya-balon-turu-guvenli-mi.json",
  "en-kapadokya-ne-zaman-gidilir.json",
  "en-cappadocia-winter-2026-guide.json",
  "en-kapadokya-aktiviteler.json",
  "en-kapadokya-fotograf-noktalari.json",
];

type Article = {
  content: string;
  faq?: { question: string; answer: string }[];
  sources?: string[];
  publishedAt: string;
  updatedAt?: string;
};
const load = (f: string): Article => JSON.parse(fs.readFileSync(path.join(ROOT, "public", "blog", f), "utf8"));
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const firstParagraph = (c: string) => c.split(/\n\s*\n/).find((b) => b.trim() && !b.trim().startsWith("#")) ?? "";
const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");

describe("geo citation standard — registry (S10)", () => {
  it("every registry entry is https, verified 200, has a quote and a listed domain", () => {
    expect(SOURCES.urls.length).toBeGreaterThan(0);
    for (const u of SOURCES.urls) {
      expect(u.url, u.id).toMatch(/^https:\/\//);
      expect(u.status, u.id).toBe(200);
      expect(u.citaat.length, u.id).toBeGreaterThan(10);
      expect(u.accessed, u.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(SOURCES.domains, u.id).toContain(host(u.url));
    }
    expect(new Set(SOURCES.urls.map((u) => u.id)).size).toBe(SOURCES.urls.length);
  });
});

describe.each(MUST_PASS)("geo citation standard — %s", (file) => {
  const a = load(file);
  const ids = a.sources ?? [];
  const entries = ids.map((id) => SOURCES.urls.find((u) => u.id === id));

  it("S1/S10: >=2 external domains, all ids resolve in the registry", () => {
    expect(entries.every(Boolean), `unknown source id in ${ids.join(",")}`).toBe(true);
    expect(new Set(entries.map((e) => host(e!.url))).size).toBeGreaterThanOrEqual(2);
  });

  it("S4: first paragraph <=60 words, number within first 200 words", () => {
    const p = firstParagraph(a.content);
    expect(words(p)).toBeLessThanOrEqual(60);
    expect(a.content.split(/\s+/).slice(0, 200).join(" ")).toMatch(/\d/);
  });

  it("S5/S6: 4-8 unique interrogative FAQs, answers <=200 words, first sentence <=35 words", () => {
    const faq = a.faq ?? [];
    expect(faq.length).toBeGreaterThanOrEqual(4);
    expect(faq.length).toBeLessThanOrEqual(8);
    expect(new Set(faq.map((f) => f.question)).size).toBe(faq.length);
    for (const f of faq) {
      expect(f.question, f.question).toMatch(/\?$/);
      expect(f.question, f.question).toMatch(/^(What|Which|Who|Where|When|Why|How|Is|Are|Do|Does|Can|Should|Will|Could|Did)\b/i);
      expect(words(f.answer), f.question).toBeLessThanOrEqual(200);
      expect(words(f.answer.split(/(?<=[.!?])\s/)[0]), f.question).toBeLessThanOrEqual(35);
    }
  });

  it("S8: updatedAt is set and manifest (drives visible date + dateModified) matches", () => {
    expect(a.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const meta = ARTICLES.find((m) => m.file === file);
    expect(meta?.updatedAt).toBe(a.updatedAt);
  });
});

describe("geo citation standard — rendering wiring (S2/S7)", () => {
  const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
  it("article component renders a visible Sources h2 and the FAQ from the same list as the schema", () => {
    const c = read("src/app/[locale]/blog/[slug]/BlogArticleContent.tsx");
    expect(c).toMatch(/id="blog-sources-heading"[^>]*>\s*Sources/);
    expect(c).toContain("article.faq.map");
    const p = read("src/app/[locale]/blog/[slug]/page.tsx");
    expect(p).toContain("faqPageSchema(article.faq)");
    expect(p).toContain("sources={getSources(article.file)}");
  });
});
