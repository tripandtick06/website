import { describe, it, expect, vi } from "vitest";

// next-intl's middleware factory is exercised indirectly; here we pin the two
// policy decisions in src/middleware.ts (live audit 2026-09-15):
//  1. uppercase paths fold to lowercase (308) — "/BALONLAR" served 200 before;
//  2. locale auto-detection runs ONLY on "/" — deep TR links used to 307 to a
//     non-existent /<lang>/blog/<tr-slug> and 404.
vi.mock("next-intl/middleware", () => ({
  default: (_routing: unknown, opts?: { localeDetection?: boolean }) =>
    Object.assign((_req: unknown) => ({ headers: new Map(), detect: opts?.localeDetection !== false }), {
      detect: opts?.localeDetection !== false,
    }),
}));

import { lowercaseRedirectTarget, isEnglishOnlyMiss } from "@/middleware";
import fs from "node:fs";
import path from "node:path";

describe("middleware locale policy", () => {
  it("lowercaseRedirectTarget folds uppercase public paths only", () => {
    expect(lowercaseRedirectTarget("/BALONLAR")).toBe("/balonlar");
    expect(lowercaseRedirectTarget("/en/Balloon-Tours")).toBe("/en/balloon-tours");
    expect(lowercaseRedirectTarget("/balonlar")).toBeNull();
    expect(lowercaseRedirectTarget("/api/Price")).toBeNull();
    expect(lowercaseRedirectTarget("/_next/static/X.js")).toBeNull();
  });

  it("pt-BR locale prefix keeps canonical casing (next-intl matches it case-sensitively)", () => {
    expect(lowercaseRedirectTarget("/pt-BR/hotels")).toBeNull();
    expect(lowercaseRedirectTarget("/pt-BR/Hotels")).toBe("/pt-BR/hotels");
    expect(lowercaseRedirectTarget("/PT-BR/hotels")).toBe("/pt-BR/hotels");
    expect(lowercaseRedirectTarget("/pt-br/hotels")).toBe("/pt-BR/hotels");
    expect(lowercaseRedirectTarget("/")).toBeNull();
  });

  it("item slugs beyond the category segment are never case-folded (pt-BR blog slugs end in -pt-BR)", () => {
    // 2026-09-16 regression: a blanket lowercase turned all nine pt-BR articles into 404s.
    expect(lowercaseRedirectTarget("/pt-BR/blog/kapadokya-ne-zaman-gidilir-pt-BR")).toBeNull();
    expect(lowercaseRedirectTarget("/blog/Some-Slug")).toBeNull();
    expect(lowercaseRedirectTarget("/en/Blog/Some-Slug")).toBe("/en/blog/Some-Slug");
    expect(lowercaseRedirectTarget("/BALONLAR/deluxe-balon-ucusu")).toBe("/balonlar/deluxe-balon-ucusu");
  });

  it("source: detection-enabled middleware is used for '/' only", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../../src/middleware.ts"), "utf8");
    expect(src).toContain('createIntlMiddleware(routing, { localeDetection: false })');
    expect(src).toMatch(/pathname === "\/" \? intlMiddleware\(req\) : intlMiddlewareNoDetect\(req\)/);
  });
});

describe("english-only page (cappadocia-balloon-facts-index)", () => {
  it("only /en/... is served; every other locale (and unprefixed tr) is a miss", () => {
    expect(isEnglishOnlyMiss("/en/cappadocia-balloon-facts-index")).toBe(false);
    expect(isEnglishOnlyMiss("/en/cappadocia-balloon-facts-index/")).toBe(false);
    expect(isEnglishOnlyMiss("/de/cappadocia-balloon-facts-index")).toBe(true);
    expect(isEnglishOnlyMiss("/pt-BR/cappadocia-balloon-facts-index")).toBe(true);
    expect(isEnglishOnlyMiss("/cappadocia-balloon-facts-index")).toBe(true);
    expect(isEnglishOnlyMiss("/en/balloon-tours")).toBe(false);
    expect(isEnglishOnlyMiss("/de/blog/cappadocia-balloon-facts-index/x")).toBe(false);
  });
});
