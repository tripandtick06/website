import { describe, it, expect } from "vitest";
import { serverDict } from "@/lib/i18n/serverDict";
import type { Locale } from "@/lib/i18n/dictionaries";
import fs from "node:fs";
import path from "node:path";
import { ARTICLES } from "@/data/blog";
import { stripBrandSuffix } from "@/lib/blog-alternates";
import { clampTitle, TITLE_BRAND_SUFFIX_LEN, TITLE_MAX } from "@/lib/title";

// Final <title> = page meta_title + layout title.template ("%s | Trip and Tick").
// The suffix string lives only here (and in the root layout); src keeps a length
// constant so seo-guards' doubled-title rule stays meaningful.
const TITLE_BRAND_SUFFIX = " | Trip and Tick";
// Site-wide ratchet: every static page meta_title in the indexable locales must
// fit in 60 chars INCLUDING the brand suffix. Keys are collected from the
// dictionary itself, so a newly added page is covered automatically.
// noindex locales (es,nl,zh,hi,ur,pt,it,ru,uk,az) are shortened too but not enforced.
const MAX = TITLE_MAX;
const INDEXABLE = ["tr", "en", "pt-BR", "ja", "fr", "de", "ko"] as const;
// meta_title_not_found / meta_title_template are fallback & noindex (/rezervasyon/[slug]) strings.
const STATIC_TITLE_KEY = /^meta_title$/;

function collectTitles(node: unknown, trail: string[] = []): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (!node || typeof node !== "object") return out;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (typeof v === "string" && STATIC_TITLE_KEY.test(k)) out.push([[...trail, k].join("."), v]);
    else if (v && typeof v === "object" && !Array.isArray(v)) out.push(...collectTitles(v, [...trail, k]));
  }
  return out;
}

describe("title length guard (<=60 incl. brand suffix) — all static pages", () => {
  it("src length constant matches the real layout suffix", () => {
    expect(TITLE_BRAND_SUFFIX.length).toBe(TITLE_BRAND_SUFFIX_LEN);
  });
  for (const loc of INDEXABLE) {
    const titles = collectTitles((serverDict(loc as Locale) as any).page);
    it(`${loc}: dictionary exposes page titles`, () => {
      expect(titles.length).toBeGreaterThan(20);
    });
    for (const [path, meta] of titles) {
      it(`${loc} ${path}`, () => {
        const full = meta + TITLE_BRAND_SUFFIX;
        expect(full.length, `"${full}" is ${full.length} chars`).toBeLessThanOrEqual(MAX);
      });
    }
  }
});

describe("dynamic titles are clamped (<=60 incl. brand suffix)", () => {
  const long =
    "Kapadokya Gün Doğumu Balon Uçuşu ve Otel Transferi Dahil Premium Deneyim Paketi — Kapadokya Özel Fiyat";
  it("clampTitle leaves short titles untouched", () => {
    expect(clampTitle("Kısa Başlık")).toBe("Kısa Başlık");
  });
  it("clampTitle shortens long slugs with an ellipsis within the budget", () => {
    const t = clampTitle(long);
    expect(t.endsWith("…")).toBe(true);
    expect((t + TITLE_BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX);
    expect(t.startsWith("Kapadokya Gün Doğumu")).toBe(true);
  });
  it("clampTitle handles one long unbroken word", () => {
    const t = clampTitle("x".repeat(200));
    expect((t + TITLE_BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX);
  });
  it("clampTitle output is idempotent", () => {
    expect(clampTitle(clampTitle(long))).toBe(clampTitle(long));
  });
});

describe("dynamic generateMetadata routes are wired through clampTitle", () => {
  // .tsx route modules cannot be imported under vitest, so assert the wiring
  // in source and the blog title pipeline on every real article.
  const ROOT = path.resolve(__dirname, "../..");
  const ROUTES = [
    "src/app/[locale]/blog/[slug]/page.tsx",
    "src/app/[locale]/balonlar/[slug]/page.tsx",
    "src/app/[locale]/oteller/[slug]/page.tsx",
    "src/app/[locale]/operatorler/[id]/page.tsx",
    "src/lib/service-detail-page.tsx", // aktiviteler|turlar|paketler|transferler /[slug]
  ];
  for (const r of ROUTES) {
    it(r, () => {
      expect(fs.readFileSync(path.join(ROOT, r), "utf8")).toMatch(/(title: |const title = )clampTitle\(/);
    });
  }
  it("blog: every article title (brand stripped, clamped) fits", () => {
    for (const a of ARTICLES) {
      const full = clampTitle(stripBrandSuffix(a.metaTitle || a.title)) + TITLE_BRAND_SUFFIX;
      expect(full.length, a.locale + "/" + a.slug + ": " + full).toBeLessThanOrEqual(MAX);
    }
  });
});
