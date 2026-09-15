import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import {
  INDEXABLE_LOCALES,
  NOINDEX_LOCALES,
  isIndexableLocale,
  isNoindexPath,
  robotsForLocale,
} from "@/lib/locale-index";
import { routing } from "@/i18n/routing";

// Owner decision 2026-09-15 (Google August 2026 spam update, GSC 85/day -> 0):
// exactly these seven locales stay indexable. Changing the set is a deliberate
// act — update this test with the reason, not just the list.
describe("locale prune policy (2026-09-15)", () => {
  it("keeps exactly the seven locales that carried GSC signal", () => {
    expect([...INDEXABLE_LOCALES].sort()).toEqual(
      ["de", "en", "fr", "ja", "ko", "pt-BR", "tr"].sort()
    );
  });

  it("indexable + noindex partition the routing locales exactly", () => {
    const all = [...INDEXABLE_LOCALES, ...NOINDEX_LOCALES].sort();
    expect(all).toEqual([...routing.locales].sort());
    const overlap = INDEXABLE_LOCALES.filter((l) =>
      (NOINDEX_LOCALES as readonly string[]).includes(l)
    );
    expect(overlap).toEqual([]);
  });

  it("robotsForLocale: noindex,follow for pruned, index,follow for kept", () => {
    expect(robotsForLocale("tr")).toEqual({ index: true, follow: true });
    expect(robotsForLocale("pt-BR")).toEqual({ index: true, follow: true });
    expect(robotsForLocale("es")).toEqual({ index: false, follow: true });
    expect(robotsForLocale("az")).toEqual({ index: false, follow: true });
    expect(isIndexableLocale("nl")).toBe(false);
  });

  it("isNoindexPath: prefix match only, pt vs pt-BR distinguished, tr root untouched", () => {
    expect(isNoindexPath("/es/hoteles")).toBe(true);
    expect(isNoindexPath("/az")).toBe(true);
    expect(isNoindexPath("/pt/blog/x")).toBe(true);
    expect(isNoindexPath("/pt-BR/hotels")).toBe(false);
    expect(isNoindexPath("/en/balloon-tours")).toBe(false);
    expect(isNoindexPath("/balonlar")).toBe(false);
    expect(isNoindexPath("/")).toBe(false);
    // a TR slug that merely starts with two letters is not a locale prefix
    expect(isNoindexPath("/it-was-not-a-locale")).toBe(false);
    expect(isNoindexPath("/es-cape")).toBe(false);
  });
});
