import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import { ARTICLES } from "@/data/blog";
import {
  blogAlternates,
  blogArticleUrl,
  blogBaseSlug,
  sitemapArticles,
  stripBrandSuffix,
} from "@/lib/blog-alternates";
import { INDEXABLE_LOCALES, NOINDEX_LOCALES } from "@/lib/locale-index";
import sitemap from "@/app/sitemap";

// Live audit 2026-09-15: 154 of 251 sitemap URLs were 404 because blog
// entries were emitted as /blog/<slug> for every locale while the page only
// exists at /<locale>/blog/<slug>. These guards pin the real URL shape.
describe("blog URLs + alternates", () => {
  it("article URL = /<locale>/blog/<slug>, tr unprefixed", () => {
    expect(blogArticleUrl({ slug: "x-de", locale: "de" })).toBe("https://tripandtick.com/de/blog/x-de");
    expect(blogArticleUrl({ slug: "x", locale: "tr" })).toBe("https://tripandtick.com/blog/x");
    expect(blogArticleUrl({ slug: "x-pt-BR", locale: "pt-BR" })).toBe("https://tripandtick.com/pt-BR/blog/x-pt-BR");
  });

  it("base slug strips one locale suffix (pt-BR handled)", () => {
    expect(blogBaseSlug("kapadokya-ne-zaman-gidilir-pt-BR")).toBe("kapadokya-ne-zaman-gidilir");
    expect(blogBaseSlug("kapadokya-ne-zaman-gidilir-de")).toBe("kapadokya-ne-zaman-gidilir");
    expect(blogBaseSlug("kapadokya-ne-zaman-gidilir")).toBe("kapadokya-ne-zaman-gidilir");
  });

  it("alternates only contain indexable locales and point at real URLs", () => {
    const fake = [
      { slug: "topic", locale: "tr" },
      { slug: "topic-en", locale: "en" },
      { slug: "topic-es", locale: "es" },
      { slug: "topic-pt-BR", locale: "pt-BR" },
    ];
    const alt = blogAlternates({ slug: "topic-en", locale: "en" }, fake);
    expect(alt).toEqual({
      "tr-TR": "https://tripandtick.com/blog/topic",
      "x-default": "https://tripandtick.com/blog/topic",
      en: "https://tripandtick.com/en/blog/topic-en",
      "pt-BR": "https://tripandtick.com/pt-BR/blog/topic-pt-BR",
    });
    expect(Object.keys(alt)).not.toContain("es");
  });

  it("sitemap articles exclude every noindex locale", () => {
    const locales = new Set(sitemapArticles().map((a) => a.locale));
    for (const l of NOINDEX_LOCALES) expect(locales.has(l)).toBe(false);
    for (const l of locales) expect((INDEXABLE_LOCALES as readonly string[]).includes(l)).toBe(true);
  });

  it("every sitemap blog URL is a page that generateStaticParams produces", () => {
    const real = new Set(ARTICLES.map((a) => blogArticleUrl(a)));
    const entries = sitemap().filter((e) => e.url.includes("/blog/"));
    expect(entries.length).toBeGreaterThan(20);
    for (const e of entries) {
      // every /blog/ URL in the sitemap — pillar links included — must be a
      // generated article page (2 pillar slugs 404'd live on 2026-09-16)
      expect(real.has(e.url), e.url).toBe(true);
      // the broken shape: TR-unprefixed path carrying a foreign-locale suffix
      expect(e.url).not.toMatch(/^https:\/\/tripandtick\.com\/blog\/.*-(de|fr|ja|ko|pt-BR|en|es|nl|zh|hi|ur|pt|it|ru|uk|az)$/);
    }
  });

  it("stripBrandSuffix removes one trailing brand, keeps everything else", () => {
    expect(stripBrandSuffix("Kapadokya Balon Turu Fiyatları 2026 | Trip and Tick")).toBe("Kapadokya Balon Turu Fiyatları 2026");
    expect(stripBrandSuffix("Title — Trip & Tick")).toBe("Title");
    expect(stripBrandSuffix("Trip and Tick in the middle | Guide")).toBe("Trip and Tick in the middle | Guide");
    expect(stripBrandSuffix("Plain title")).toBe("Plain title");
  });
});

describe("editorial noindex (EN cannibalisation cleanup 2026-09-16)", () => {
  it("noindexed articles are out of the sitemap and out of every hreflang cluster", () => {
    const flagged = ARTICLES.filter((a) => a.noindex);
    // 12 EN (2026-09-16 cannibalisation) + 29 zero-impression translations (2026-09-19 GSC prune,
    // tests/lib/blog-prune.test.ts holds the list).
    expect(flagged.length).toBe(41);
    for (const a of flagged) expect(["en", "de", "fr", "ja", "ko", "pt-BR"], a.slug).toContain(a.locale);
    const sitemapUrls = new Set(sitemapArticles().map((a) => blogArticleUrl(a)));
    for (const a of flagged) {
      expect(sitemapUrls.has(blogArticleUrl(a)), a.slug).toBe(false);
      const alt = blogAlternates(a);
      expect(Object.values(alt)).not.toContain(blogArticleUrl(a));
    }
  });

  it("no article carries a leaked generation instruction as targetKeyword", () => {
    for (const a of ARTICLES) {
      expect(a.targetKeyword.toLowerCase(), a.slug).not.toMatch(/^(publish|write|create|generate)\b/);
    }
  });
});
