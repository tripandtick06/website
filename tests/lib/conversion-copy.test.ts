import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SUPPORTED_LOCALES } from "@/lib/i18n/dictionaries";
import { TOURS, TRANSFERS } from "@/data/services/catalog";
import { LANG_BANNER, lowestPrice, toursSubline, transfersSubline } from "@/lib/conversion-copy";

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("conversion copy (2026-10-16)", () => {
  it("every shipped locale has a tours + transfers subline and a banner string", () => {
    const t = lowestPrice(TOURS);
    const x = lowestPrice(TRANSFERS);
    for (const loc of SUPPORTED_LOCALES) {
      expect(toursSubline(loc, t.price, t.currency), loc).toContain(String(t.price));
      expect(transfersSubline(loc, x.price, x.currency), loc).toContain(String(x.price));
      expect(LANG_BANNER[loc], loc).toBeTruthy();
    }
  });

  it("prices come from the catalogue minimum and stay in from-style (tr suffix)", () => {
    expect(toursSubline("tr", 50)).toBe("€50'den başlayan fiyatlar");
    expect(toursSubline("tr", 30)).toBe("€30'dan başlayan fiyatlar");
    expect(transfersSubline("tr", 12)).toBe("Nevşehir / Kayseri havalimanı transfer · sabit fiyat · €12'den başlayan");
    expect(transfersSubline("en", 12)).toContain("from €12");
  });

  it("tours + transfers heroes carry the trust row, photo and subline", () => {
    for (const f of ["src/app/[locale]/turlar/TurlarContent.tsx", "src/app/[locale]/transferler/TransferlerContent.tsx"]) {
      const src = read(f);
      expect(src, f).toContain("subline=");
      expect(src, f).toContain("mobileImage=");
      expect(src, f).toMatch(/\btrust\b/);
    }
    expect(read("src/components/sections/HeroSection.tsx")).toContain("<TrustBadges");
    expect(read("src/components/layout/PageHero.tsx")).toContain("<TrustBadges");
  });

  it("language banner is client-side only: no redirect, tr-gated, cookie lang_banner", () => {
    const src = read("src/components/layout/LangBanner.tsx");
    expect(src).toContain("lang_banner");
    expect(src).toContain('startsWith("tr")');
    expect(src).not.toMatch(/router\.(push|replace)|redirect\(/);
    expect(read("src/app/[locale]/layout.tsx")).toContain("<LangBanner />");
  });
});
