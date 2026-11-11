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
  "en-kapadokya-istanbuldan-nasil-gidilir.json",
  "en-kapadokya-otel-tavsiye-2026.json",
  "en-kapadokya-dugun-fotografciligi-rehberi.json",
  "en-3-gunluk-kapadokya-gezi-plani.json",
  "en-cappadocia-hotel-booking-guide-en.json",
  "en-cappadocia-how-many-people-fit-in-a-hot-air-balloon-en.json",
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

// Fabricated-claim guard, ALL locales (PR #75 removed these from EN/TR; the machine-translated
// locales and noindex EN files must stay clean). Own-company claims (5% price match, 100% refund)
// and the Istanbul duration lock are intentionally NOT covered here.
const FORBIDDEN: [string, RegExp][] = [
  ["operator data", /operator data|trip and tick data/i],
  ["70-80% fly rate", /70\s?[-–]\s?80\s?%/],
  ["40M insurance", /40\s?(M\b|million|milyon|millionen)/i],
  ["12-18% below market", /12\s?[-–]\s?18\s?%/],
  ["18% combo saving", /(?<![\d.,])18\s?%/],
  ["41%/23%", /(?<![\d.,])(41|23)\s?%/],
  ["72%", /(?<![\d.,])72\s?%/],
  ["battery -40%", /[-−–]\s?40\s?%/],
  ["25 km/h wind", /25\s?km/i],
  ["200-hour maintenance", /200[\s-]?(h\b|hour|saat|Stunden|heures)/i],
  ["fake permit email", /kultur\.gov\.tr/],
  ["named operator list", /Kaya Balloons/],
];
const LOCALE_FILES = fs
  .readdirSync(path.join(ROOT, "public", "blog"))
  .filter((f) => f.endsWith(".json") && !/^(en|tr)-/.test(f) || f === "en-heissluftballon-kappadokien-preise.json");

describe("geo citation standard — fabricated claims absent in every locale", () => {
  it("covers the translated locales", () => {
    expect(LOCALE_FILES.length).toBeGreaterThan(100);
  });
  it.each(FORBIDDEN)("%s", (_name, re) => {
    const hits: string[] = [];
    for (const f of LOCALE_FILES) {
      const a = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "blog", f), "utf8"));
      const text = [a.title, a.metaTitle, a.metaDescription, a.excerpt, a.content, JSON.stringify(a.faq ?? [])].join("\n");
      if (re.test(text)) hits.push(f);
    }
    expect(hits).toEqual([]);
  });
});

// Wave 3 — residue in translated locale articles. Scoped per article slug because the same digits
// are legitimate elsewhere (own transfer price, bus-duration table row locked by istanbul-duration.test.ts).
const SCOPED: [string, string, RegExp][] = [
  ["kapadokya-istanbuldan-nasil-gidilir", "istanbul: price list in meta (EUR 45/18/120)", /€\s?(45|18|120)(?!\d)|(?<!\d)(45|18|120)\s?(€|EUR|euro)/i],
  ["kapadokya-istanbuldan-nasil-gidilir", "istanbul: 30% intro stat", /(?<![\d.,])30\s?%/],
  ["kapadokya-istanbuldan-nasil-gidilir", "istanbul: 20 kg bus luggage", /(?<![\d.,])20\s?(kg|кг|公斤|キロ|킬로)/i],
  ["kapadokya-istanbuldan-nasil-gidilir", "istanbul: flights-per-day frequency", /(?<![\d.,])(4\s?[-–]\s?6|8\s?[-–]\s?12)(?![\d.,])/],
  ["kapadokya-istanbuldan-nasil-gidilir", "istanbul: O-21 drive claim", /\bO-21\b/],
  ["cappadocia-winter-2026-guide", "winter: O-21 drive time", /\bO-21\b/],
  ["cappadocia-winter-2026-guide", "winter: 30% body heat / 20% pensions closed", /(?<![\d.,])(30|20)\s?%/],
  ["cappadocia-winter-2026-guide", "winter: avg temps", /-\s?6\s?°|(?<![\d.,])3\s?°\s?C/],
  ["kapadokya-otel-tavsiye-2026", "hotel: 30% of trip / 30-35 C", /(?<![\d.,])30\s?%|30\s?[-–]\s?35\s?°/],
  ["kapadokya-ne-zaman-gidilir", "season: 14.5 h day length", /14[.,]5/],
  ["kapadokya-ne-zaman-gidilir", "season: 30% sells more / 30 years operator data", /(?<![\d.,])30\s?%\s?(in più|besser|多く|más|de plus|больше|more|meer)|30(年| anos)/i],
  ["kapadokya-fotograf-noktalari", "photo spots: 4 km from Cavusin", /(?<![\d.,])4\s?(km|км|公里|キロ|킬로)/i],
  ["ballonvaart-cappadocie", "nl balloon: pickup hour / freezing / basket of 4-8", /vier of vijf uur|rond het vriespunt|vier tot acht/i],
];
const BLOG = path.join(ROOT, "public", "blog");

describe("geo citation standard — wave 3 scoped residue", () => {
  it.each(SCOPED)("%s — %s", (slug, _name, re) => {
    const files = LOCALE_FILES.filter((f) => f.endsWith(`-${slug}.json`));
    expect(files.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const f of files) {
      const a = JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8"));
      const text = [a.title, a.metaTitle, a.metaDescription, a.excerpt, a.content, JSON.stringify(a.faq ?? [])].join("\n");
      if (re.test(text)) hits.push(f);
    }
    expect(hits).toEqual([]);
  });
  it.each(["nl-beste-tijd-ballonvaart-cappadocie.json", "nl-kosten-ballonvaart-cappadocie.json"])("%s keeps 4-8 FAQ entries", (f) => {
    const a = JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8"));
    expect(a.faq.length).toBeGreaterThanOrEqual(4);
    expect(a.faq.length).toBeLessThanOrEqual(8);
  });
});
