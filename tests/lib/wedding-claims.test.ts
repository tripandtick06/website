// Guard: Cappadocia wedding-photography article (kapadokya-dugun-fotografciligi*), all 17 languages.
// Fabricated entrance fees, price bands, "top 10", drone-package/insurance, equipment brands,
// "8+ dress ateliers", winter temperature and "5 years" claims were removed (GEO wave 3). Weather
// figures that remain come from the official MGM table in the article; own-business prices
// (EUR 245 / 100 / 35 / 55, 100% refund) are intentionally NOT matched by any pattern below.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ARTICLES } from "@/data/blog";

const BLOG = path.resolve(__dirname, "../../public/blog");
const FILES = fs.readdirSync(BLOG).filter((f) => /-kapadokya-dugun-fotografciligi/.test(f) && f.endsWith(".json"));

const FORBIDDEN: [string, RegExp][] = [
  ["EUR 450 / 1,500 price band", /(?<![\d.,])450(?![\d])|(?<![\d])1[.,\s]?500(?![\d])/],
  ["entrance fee 4/5/8 EUR or 5-8 EUR", /(?<![\d.,])(4|5|8)\s?(€|EUR|euro|Euro)|[€]\s?(4|5|8)(?![\d.,])|(?<![\d.,])5\s?[-–]\s?8\s?(€|EUR)?/],
  ["top-10 locations", /(?<![\d.,])10(?![\d.,月월])/],
  ["8+ / 30+ counts (dress ateliers, drone shots)", /(?<![\d.,])(8|30)\s?\+/],
  ["winter -8..+6 C", /[-−–]\s?8\s?°|\+\s?6\s?°/],
  ["camera / drone brand models", /DJI|Mavic|Sony\s?A7|Canon\s?R5|Nikon\s?Z7/i],
  ["5 years golden age", /(?<![\d.,])5[\s-]?(years?|Jahre?n?|ans|años|anni|anos|jaar|yıl|il|年|년|лет|років|साल|سال)\b|fünf Jahren|five years|cinq ans/i],
  ["drone package + insurance by operator", /40\s?M|licensed (contract )?pilot|lisanslı pilot|Sondergenehmigung/i],
  ["2 nights / 4 hours package contents", /2\s?(nights|Nächte|noches|nuits|notti|noites|nachten|gece)\s.*(hotel|Hotel|otel)|4\s?(hours|Stunden|horas|heures|ore|uur|saat)\s.*(shoot|Shooting|sesión|séance|servizio|fotosessie|çekim)/i],
];

const textOf = (a: Record<string, unknown>) =>
  [a.title, a.metaTitle, a.metaDescription, a.excerpt, a.content, JSON.stringify(a.faq ?? [])].join("\n");

describe("wedding article — fabricated claims absent in all languages", () => {
  it("covers all 17 languages", () => {
    expect(FILES.length).toBe(17);
  });
  it.each(FORBIDDEN)("%s", (_name, re) => {
    const hits = FILES.filter((f) => re.test(textOf(JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8")))));
    expect(hits).toEqual([]);
  });
  it("manifest metadata (feeds <meta>) is clean and in sync with the JSON", () => {
    for (const f of FILES) {
      const a = JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8"));
      const m = ARTICLES.find((x) => x.file === f);
      expect(m, f).toBeTruthy();
      expect([m!.title, m!.metaTitle, m!.metaDescription, m!.excerpt], f).toEqual([a.title, a.metaTitle, a.metaDescription, a.excerpt]);
      for (const [name, re] of FORBIDDEN) expect(re.test([m!.title, m!.metaTitle, m!.metaDescription, m!.excerpt].join("\n")), `${f} ${name}`).toBe(false);
    }
  });
  it("every language keeps 4-8 FAQ entries with a first sentence of at most 35 words", () => {
    for (const f of FILES) {
      const a = JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8"));
      expect(a.faq?.length, f).toBeGreaterThanOrEqual(4);
      expect(a.faq.length, f).toBeLessThanOrEqual(8);
      for (const q of a.faq) {
        const first = q.answer.split(/(?<=[.!?。！？।۔])\s?/)[0];
        expect(first.split(/\s+/).length, `${f}: ${q.question}`).toBeLessThanOrEqual(35);
      }
    }
  });
  it("metaTitle fits the 44-char CTR budget", () => {
    for (const f of FILES) {
      const a = JSON.parse(fs.readFileSync(path.join(BLOG, f), "utf8"));
      expect(a.metaTitle.replace(/\s*\|\s*Trip and Tick$/i, "").length, f).toBeLessThanOrEqual(44);
    }
  });
});
