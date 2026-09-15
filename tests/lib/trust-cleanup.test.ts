import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import {
  ORGANIZATION_SCHEMA,
  articleSchema,
  lodgingSchema,
  productSchema,
  serviceSchema,
  touristTripSchema,
} from "@/lib/schema";

// 2026-09-15 trust cleanup. Every rating / reviewCount in src/data/services/*
// is placeholder data and src/data/reviews.ts is mock; the "12,000+ customers
// / 4.9" figures had no dataset behind them (first real sale: 2026-09-15).
// Emitting them as schema.org facts or on-page claims is the deceptive class
// Google issues manual actions for. These guards make re-adding them a
// deliberate act: bring a real, moderated dataset and rewrite the tests.
describe("trust cleanup (2026-09-15)", () => {
  const base = { slug: "x", name: "X", description: "d", price: 165, currency: "EUR" };

  it("no schema builder emits aggregateRating or review nodes", () => {
    const nodes = [
      touristTripSchema({ ...base, duration: "1 saat", rating: 4.9, reviewCount: 2847 }),
      productSchema({
        ...base,
        rating: 4.9,
        reviewCount: 2847,
        reviews: [{ author: "Mock", rating: 5, text: "t", date: "2026-05-10" }],
      }),
      serviceSchema({ ...base, category: "c", rating: 4.9, reviewCount: 10 }),
      lodgingSchema({ slug: "h", name: "H", description: "d", rating: 4.9, reviewCount: 1856 }),
    ];
    for (const n of nodes) {
      const json = JSON.stringify(n);
      expect(json).not.toContain("AggregateRating");
      expect(json).not.toContain('"review"');
      expect(json).not.toContain("ratingValue");
    }
  });

  it("Organization schema carries no placeholder founder Person", () => {
    const json = JSON.stringify(ORGANIZATION_SCHEMA);
    expect(json).not.toContain("founder");
    expect(json).not.toContain("Trip and Tick Ekibi");
  });

  it("article author falls back to Organization, never a placeholder Person", () => {
    const a = articleSchema({
      slug: "s",
      title: "t",
      description: "d",
      datePublished: "2026-05-01",
      authorType: "Person",
    });
    expect(a.author["@type"]).toBe("Organization");
    expect(JSON.stringify(a)).not.toContain("Trip and Tick Ekibi");
  });

  it("no '12,000+ customers' / '4.9 rating' claims in dictionaries, meta, llms", () => {
    const root = path.resolve(__dirname, "../..");
    const files = [
      "src/lib/i18n/dictionaries.ts",
      "public/llms.txt",
      "public/llms-full.txt",
      ...fs
        .readdirSync(path.join(root, "src/data/i18n"))
        .filter((f) => f.startsWith("meta."))
        .map((f) => `src/data/i18n/${f}`),
    ];
    const re = /12[.,]000\+?|12 000\+?|\b12000\b|4[.,]9\s*\/\s*5/;
    for (const f of files) {
      const txt = fs.readFileSync(path.join(root, f), "utf8");
      expect(txt, f).not.toMatch(re);
    }
  });
});
