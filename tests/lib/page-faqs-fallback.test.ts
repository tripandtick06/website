import { describe, it, expect } from "vitest";
import { getPageFaqs } from "@/data/i18n/pageFaqs";

// Regression: ja/ko/pt-BR have no PAGE_FAQS entry; they must not receive Turkish text.
describe("getPageFaqs fallback", () => {
  it("returns the tr set for tr", () => {
    expect(getPageFaqs("packages", "tr")[0].question).toBe("Paket fiyatları kişi başı mı yoksa toplam mı?");
  });

  it("falls back to en for ja, ko and pt-BR (not tr)", () => {
    for (const loc of ["ja", "ko", "pt-BR"] as const) {
      expect(getPageFaqs("packages", loc)).toEqual(getPageFaqs("packages", "en"));
      expect(getPageFaqs("transfers", loc)).toEqual(getPageFaqs("transfers", "en"));
    }
    expect(getPageFaqs("activities", "ja")[0].question).toBe("What activities are available in Cappadocia?");
  });
});
