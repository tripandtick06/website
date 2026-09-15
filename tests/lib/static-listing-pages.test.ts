import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// 2026-09-16: listing pages + homepage are prerendered (force-static) and
// served as static assets on Cloudflare Pages. They read only dictionaries /
// catalog data, so per-request edge rendering (~0.9 s TTFB) bought nothing.
// A page that needs headers()/cookies()/searchParams must NOT be in this
// list — put it back on the edge runtime deliberately and remove it here.
const STATIC_PAGES = [
  "", "balonlar", "oteller", "aktiviteler", "turlar", "paketler", "transferler",
  "operatorler", "kapadokya", "sss", "hakkimizda", "blog", "iletisim", "yorum",
];

describe("static listing pages", () => {
  const root = path.resolve(__dirname, "../../src/app/[locale]");
  for (const seg of STATIC_PAGES) {
    it(`/${seg || "(home)"} is force-static and not edge`, () => {
      const src = fs.readFileSync(path.join(root, seg, "page.tsx"), "utf8");
      // strip line comments so the explanatory note above the export does not trip the check
      const code = src.replace(/^\s*\/\/.*$/gm, "");
      expect(code).toMatch(/export const dynamic = "force-static"/);
      expect(code).toMatch(/export const dynamicParams = false/);
      expect(code).not.toMatch(/export const runtime = "edge"/);
      expect(code).not.toMatch(/\bheaders\(\)|\bcookies\(\)|searchParams/);
    });
  }
});
