import { describe, it, expect } from "vitest";
import { ARTICLES } from "@/data/blog/index";

// 2026-09-19 GSC-driven prune: 29 machine-translated blog articles (de/fr/ja/ko/pt-BR)
// had 0 impressions in the 90 days after the August 2026 spam update → noindex,follow
// (page stays online, leaves sitemap + hreflang). TR/EN originals and every translation
// that DID earn impressions (e.g. pt-BR/ja/fr istanbuldan-nasil-gidilir) stay indexable.
// Re-indexing one of these = a visible act: remove it here with the GSC reason.
const PRUNED = [
  "cappadocia-hot-air-balloon-price-2026-ja", "cappadocia-hot-air-balloon-price-2026-ko", "cappadocia-hot-air-balloon-price-2026-pt-BR",
  "cappadocia-winter-2026-guide-fr", "cappadocia-winter-2026-guide-ja", "cappadocia-winter-2026-guide-ko", "cappadocia-winter-2026-guide-pt-BR",
  "heissluftballon-kappadokien-preise-buchung", "heissluftballon-kappadokien-preise-buchung-fr", "heissluftballon-kappadokien-preise-buchung-ja",
  "heissluftballon-kappadokien-preise-buchung-ko", "heissluftballon-kappadokien-preise-buchung-pt-BR",
  "kapadokya-aktiviteler-fr", "kapadokya-aktiviteler-ja", "kapadokya-aktiviteler-ko", "kapadokya-aktiviteler-pt-BR",
  "kapadokya-dugun-fotografciligi-rehberi-de", "kapadokya-dugun-fotografciligi-rehberi-fr", "kapadokya-dugun-fotografciligi-rehberi-ko", "kapadokya-dugun-fotografciligi-rehberi-pt-BR",
  "kapadokya-fotograf-noktalari-fr", "kapadokya-fotograf-noktalari-ja", "kapadokya-fotograf-noktalari-pt-BR",
  "kapadokya-istanbuldan-nasil-gidilir-fr", "kapadokya-ne-zaman-gidilir-de", "kapadokya-ne-zaman-gidilir-ja", "kapadokya-ne-zaman-gidilir-ko",
  "kapadokya-otel-tavsiye-2026-fr", "kapadokya-otel-tavsiye-2026-pt-BR",
];

// Translations that were the site's top impression earners — must never be swept up.
const KEEP_INDEXABLE = [
  "kapadokya-istanbuldan-nasil-gidilir-pt-BR", "kapadokya-istanbuldan-nasil-gidilir-ja", "kapadokya-istanbuldan-nasil-gidilir-en",
  "kapadokya-ne-zaman-gidilir-fr", "kapadokya-ne-zaman-gidilir-pt-BR", "kapadokya-fotograf-noktalari-en",
];

describe("GSC-driven blog prune (2026-09-19)", () => {
  it("zero-impression translated articles are noindex", () => {
    const bySlug = new Map(ARTICLES.map((a) => [a.slug, a]));
    for (const slug of PRUNED) {
      expect(bySlug.get(slug)?.noindex, slug).toBe(true);
    }
  });

  it("originals and impression-earning translations stay indexable", () => {
    const bySlug = new Map(ARTICLES.map((a) => [a.slug, a]));
    for (const slug of KEEP_INDEXABLE) {
      expect(bySlug.has(slug), slug).toBe(true);
      expect(bySlug.get(slug)?.noindex, slug).not.toBe(true);
    }
    // TR originals are never pruned (EN carries its own 2026-09-16 cannibalisation noindex set).
    for (const a of ARTICLES) {
      if (a.locale === "tr") expect(a.noindex, a.slug).not.toBe(true);
    }
  });
});
