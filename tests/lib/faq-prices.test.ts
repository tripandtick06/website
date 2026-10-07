import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES } from "@/data/services/catalog";

const faqs = fs.readFileSync(path.resolve(__dirname, "../../src/data/i18n/pageFaqs.ts"), "utf8");
const price = (slug: string) => ([...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES] as any[]).find((s) => s.slug === slug)?.adultPrice;

describe("FAQ 'from' prices match the catalog", () => {
  it("activities start from the cheapest activity (ATV/jeep standard)", () => {
    const min = Math.min(...([...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES] as any[]).filter((s) => s.category === "activity" && ["atv-standart", "jeep-standart", "at-standart", "turk-gecesi-yemekli"].includes(s.slug)).map((s) => s.adultPrice));
    expect(min).toBe(25);
    expect(faqs).not.toMatch(/€29/);
    expect(faqs).toContain("€25");
  });
  it("Red tour FAQ price equals catalog", () => {
    expect(price("kirmizi-tur")).toBe(50);
    expect(faqs).not.toMatch(/€45/);
  });
});
