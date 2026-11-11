// CTR rewrite guard (growth #10): FR/EN/PT-BR Kapadokya articles that ranked pos 5-9 with ~0 clicks.
// Titles must fit 44 chars so the final <title> (+ " | Trip and Tick", 16) is <=60 and is NOT
// clamped with an ellipsis; the manifest (what <meta> really uses) must match the JSON; the B2B
// CTA must stay on the pages where it fits the intent.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ARTICLES } from "@/data/blog";
import { TITLE_MAX, TITLE_BRAND_SUFFIX_LEN } from "@/lib/title";

const ROOT = path.resolve(__dirname, "../..");
const PAGES: { file: string; b2b: string | null }[] = [
  { file: "fr-kapadokya-ne-zaman-gidilir.json", b2b: "/fr/b2b" },
  { file: "en-kapadokya-istanbuldan-nasil-gidilir.json", b2b: "/en/b2b" },
  { file: "pt-BR-kapadokya-ne-zaman-gidilir.json", b2b: "/pt-BR/b2b" },
  { file: "pt-BR-kapadokya-istanbuldan-nasil-gidilir.json", b2b: "/pt-BR/b2b" },
  { file: "en-kapadokya-otel-tavsiye-2026.json", b2b: "/en/b2b" },
  { file: "en-cappadocia-winter-2026-guide.json", b2b: null },
];

describe("CTR rewrite — titles, meta, manifest, B2B CTA", () => {
  for (const { file, b2b } of PAGES) {
    const a = JSON.parse(fs.readFileSync(path.join(ROOT, "public/blog", file), "utf8"));
    const m = ARTICLES.find((x) => x.file === file);
    it(`${file}: metaTitle fits (<=60 with brand), no trailing brand`, () => {
      expect(a.metaTitle.length + TITLE_BRAND_SUFFIX_LEN).toBeLessThanOrEqual(TITLE_MAX);
      expect(a.metaTitle).not.toMatch(/Trip and Tick/i);
    });
    it(`${file}: metaDescription <=155`, () => {
      expect(a.metaDescription.length).toBeLessThanOrEqual(155);
    });
    it(`${file}: manifest matches JSON (stale-manifest guard)`, () => {
      expect(m?.metaTitle).toBe(a.metaTitle);
      expect(m?.metaDescription).toBe(a.metaDescription);
    });
    if (b2b) {
      it(`${file}: B2B CTA link ${b2b} present`, () => {
        expect(a.content).toContain(`](${b2b})`);
      });
    }
  }
});
