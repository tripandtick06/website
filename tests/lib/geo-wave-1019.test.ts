import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { PAGE_UPDATED } from "@/lib/page-dates";
import { TR_GUIDE_FACTS } from "@/data/trBalloonGuide";

const read = (p: string) => readFileSync(p, "utf8");

describe("GEO wave 2026-10-19", () => {
  it("home, turlar and balonlar render a visible date and emit dateModified", () => {
    for (const [file, key] of [
      ["src/app/[locale]/page.tsx", "/"],
      ["src/app/[locale]/turlar/page.tsx", "/turlar"],
      ["src/app/[locale]/balonlar/page.tsx", "/balonlar"],
    ] as const) {
      const src = read(file);
      expect(src, file).toContain("webPageSchema(");
      expect(src, file).toContain(`PAGE_UPDATED["${key}"]`);
      expect(src, file).toContain("LastUpdated");
      expect(PAGE_UPDATED[key]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("/balonlar TR carries >=3 verifiable SHGM facts, each with a verbatim quote and source link", () => {
    expect(TR_GUIDE_FACTS.length).toBeGreaterThanOrEqual(3);
    for (const f of TR_GUIDE_FACTS) {
      expect(f.sourceUrl).toMatch(/^https:\/\/web\.shgm\.gov\.tr\//);
      expect(f.quote.length).toBeGreaterThan(30);
      // no euro amounts in regulatory facts (from-pricing lock)
      expect(/€|euro/i.test(f.text + f.quote)).toBe(false);
    }
  });

  it("RSS feed lives at /rss.xml and is advertised in <head>", () => {
    expect(existsSync("src/app/rss.xml/route.ts")).toBe(true);
    expect(read("src/app/[locale]/page.tsx")).toContain("/rss.xml");
    expect(read("src/app/[locale]/blog/page.tsx")).toContain("/rss.xml");
  });

  it("ai.txt is served from both /ai.txt and /.well-known/ai.txt", () => {
    expect(read("public/.well-known/ai.txt")).toBe(read("public/ai.txt"));
  });
});
