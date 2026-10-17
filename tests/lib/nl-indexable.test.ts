import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import { isNoindexPath, isIndexableBlogSlug, robotsForPage, NL_EDITORIAL_BLOG_SLUGS } from "@/lib/locale-index";
import { generateHreflang } from "@/lib/hreflang";
import { NL_GUIDE_INTRO, NL_GUIDE_SECTIONS, NL_BALLOON_FAQ } from "@/data/i18n/nlBalloonGuide";
import { routing } from "@/i18n/routing";
import sitemap from "@/app/sitemap";

const words = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
// net price in any form: a bare euro amount that is not preceded by "vanaf"/"from"
const NET_PRICE = /(€\s?(165|215|295)\b|\b(165|215|295)\s?(€|euro|eur)\b|netto|net price|nettoprijs)/i;

describe("NL pages with original copy are indexable", () => {
  it("/nl and /nl/ballonvaarten lose noindex; other nl paths keep it", () => {
    expect(isNoindexPath("/nl")).toBe(false);
    expect(isNoindexPath("/nl/")).toBe(false);
    expect(isNoindexPath("/nl/ballonvaarten")).toBe(false);
    expect(isNoindexPath("/nl/hotels")).toBe(true);
    expect(isNoindexPath("/nl/ballonvaarten/standaard")).toBe(true);
    expect(isNoindexPath("/nl/blog/kapadokya-ne-zaman-gidilir-nl")).toBe(true);
    for (const s of NL_EDITORIAL_BLOG_SLUGS) expect(isNoindexPath(`/nl/blog/${s}`)).toBe(false);
    // other pruned locales untouched
    for (const l of ["es", "zh", "it", "ru", "pt", "hi", "ur", "uk", "az"]) {
      expect(isNoindexPath(`/${l}`)).toBe(true);
    }
  });

  it("robotsForPage: nl indexable only on the opt-in paths", () => {
    expect(robotsForPage("nl", "/")).toEqual({ index: true, follow: true });
    expect(robotsForPage("nl", "/balonlar")).toEqual({ index: true, follow: true });
    expect(robotsForPage("nl", "/oteller")).toEqual({ index: false, follow: true });
    expect(robotsForPage("es", "/balonlar")).toEqual({ index: false, follow: true });
  });

  it("hreflang lists nl only for opt-in pages, never other pruned locales", () => {
    expect(generateHreflang("/balonlar").nl).toBe("https://tripandtick.com/nl/ballonvaarten");
    expect(generateHreflang("/oteller").nl).toBeUndefined();
  });

  it("sitemap lists the NL URLs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://tripandtick.com/nl");
    expect(urls).toContain("https://tripandtick.com/nl/ballonvaarten");
    for (const s of NL_EDITORIAL_BLOG_SLUGS) expect(urls).toContain(`https://tripandtick.com/nl/blog/${s}`);
  });
});

describe("single hreflang producer", () => {
  it("next-intl HTTP Link header (alternateLinks) is off", () => {
    expect((routing as { alternateLinks?: boolean }).alternateLinks).toBe(false);
  });
});

describe("NL balloon guide content", () => {
  const body = [NL_GUIDE_INTRO, ...NL_GUIDE_SECTIONS.flatMap((s) => [s.heading, ...s.paragraphs])].join(" ");
  const faq = NL_BALLOON_FAQ.map((f) => `${f.question} ${f.answer}`).join(" ");

  it("has 800+ words and 6+ FAQ", () => {
    expect(words(body) + words(faq)).toBeGreaterThanOrEqual(800);
    expect(NL_BALLOON_FAQ.length).toBeGreaterThanOrEqual(6);
  });

  it("uses from-prices only", () => {
    expect(body + faq).not.toMatch(NET_PRICE);
    expect(body).toMatch(/vanaf 100 euro/);
  });
});

describe("NL editorial blog posts", () => {
  for (const slug of NL_EDITORIAL_BLOG_SLUGS) {
    const file = path.join(process.cwd(), "public", "blog", `nl-${slug}.json`);
    it(`${slug}: nl, indexable, 700+ words, no net price`, () => {
      const a = JSON.parse(fs.readFileSync(file, "utf8"));
      expect(a.slug).toBe(slug);
      expect(a.locale).toBe("nl");
      expect(a.noindex).toBeFalsy();
      expect(isIndexableBlogSlug("nl", a.slug)).toBe(true);
      expect(words(a.content)).toBeGreaterThanOrEqual(700);
      expect(JSON.stringify(a)).not.toMatch(NET_PRICE);
    });
  }
});

describe("permanent redirects for localized slugs", () => {
  it("307 -> 308 except the root", async () => {
    const { permanentLocalizedSlugRedirect } = await import("@/middleware");
    const mk = (status: number) => ({ status, headers: new Headers({ location: "https://tripandtick.com/en/balloon-tours" }) });
    expect(permanentLocalizedSlugRedirect(mk(307), "/en/balonlar").status).toBe(308);
    expect(permanentLocalizedSlugRedirect(mk(307), "/").status).toBe(307);
    expect(permanentLocalizedSlugRedirect(mk(200), "/en/x").status).toBe(200);
  });
});
