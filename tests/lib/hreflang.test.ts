import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

describe("generateHreflang", () => {
  it("returns 9 locales + x-default", () => {
    const out = generateHreflang("/balonlar");
    const keys = Object.keys(out);
    for (const t of ["tr-TR", "en", "de", "fr", "es", "nl", "zh-Hans", "hi", "ur", "x-default"]) {
      expect(keys).toContain(t);
    }
    expect(keys).toHaveLength(10);
  });

  it("normalizes paths missing leading slash", () => {
    const a = generateHreflang("balonlar");
    const b = generateHreflang("/balonlar");
    expect(a).toEqual(b);
  });

  it("default locale (tr) is unprefixed, others get `/locale`", () => {
    const out = generateHreflang("/balonlar");
    expect(out["tr-TR"]).toBe("https://tripandtick.com/balonlar");
    expect(out.en).toBe("https://tripandtick.com/en/balonlar");
    expect(out["zh-Hans"]).toBe("https://tripandtick.com/zh/balonlar");
  });

  it("handles root path without double slash", () => {
    const out = generateHreflang("/");
    expect(out["tr-TR"]).toBe("https://tripandtick.com");
    expect(out.en).toBe("https://tripandtick.com/en");
    expect(out["x-default"]).toBe("https://tripandtick.com");
  });

  it("x-default falls back to unprefixed tr", () => {
    const out = generateHreflang("/oteller");
    expect(out["x-default"]).toBe("https://tripandtick.com/oteller");
  });
});

describe("ogImageUrl", () => {
  it("builds /api/og query with title only", () => {
    const u = ogImageUrl("Kapadokya Balon");
    expect(u).toBe("/api/og?title=Kapadokya+Balon");
  });

  it("includes subtitle when provided", () => {
    const u = ogImageUrl("X", "Y Z");
    expect(u).toBe("/api/og?title=X&subtitle=Y+Z");
  });

  it("URL-encodes special chars", () => {
    const u = ogImageUrl("a&b", "c=d");
    expect(u).toContain("title=a%26b");
    expect(u).toContain("subtitle=c%3Dd");
  });
});
