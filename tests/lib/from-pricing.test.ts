import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { SUPPORTED_LOCALES } from "@/lib/i18n/dictionaries";
import { fromPriceShort } from "@/lib/price-label";
import { buildWhatsAppHref } from "@/lib/whatsapp";

// 2026-09-18 owner decision: the site publishes STARTING prices only ("from €X"),
// packages are priced on request, and these products were removed. Reverting any
// of this must be a visible act (delete/rewrite this test), not an accidental edit.

const ROOT = path.resolve(__dirname, "../..");
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const REMOVED_SLUGS = ["deluxe-balon-ucusu", "turk-gecesi-yemeksiz", "sari-tur", "yeralti-turu"];

// Starting prices dictated verbatim by the owner (EUR, per person).
const FROM_PRICES: Record<string, number> = {
  "standart-balon-ucusu": 100,
  "atv-standart": 25,
  "atv-sunrise": 35,
  "atv-sunset": 35,
  "jeep-standart": 25,
  "jeep-sunrise": 30,
  "jeep-sunset": 30,
  "at-standart": 35,
  "at-sunrise": 35,
  "at-sunset": 35,
  "hamam-standart": 50,
  "hamam-deluxe": 75,
  "turk-gecesi-yemekli": 30,
  "microlight-standart": 95,
  "microlight-deluxe": 175,
  "balon-flying-dress-cekimi": 245,
  "kirmizi-tur": 50,
  "yesil-tur": 50,
  "mix-tur": 50,
  "eco-yesil-tur": 50,
  "gun-batimi-turu": 30,
};

const ALL = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];

describe("from-pricing (2026-09-18)", () => {
  it("removed products are gone from the catalogue and every locale data file", () => {
    const slugs = new Set([...ALL.map((s) => s.slug), ...BALLOON_PACKAGES.map((b) => b.slug)]);
    for (const r of REMOVED_SLUGS) expect(slugs.has(r), r).toBe(false);
    for (const loc of SUPPORTED_LOCALES) {
      if (loc === "tr") continue;
      const d = readJson(`src/data/i18n/data.${loc}.json`);
      for (const r of REMOVED_SLUGS) {
        expect(r in d.services || r in d.balloons, `${loc}: ${r}`).toBe(false);
      }
    }
  });

  it("starting prices match the owner's list", () => {
    const bySlug = new Map<string, number>();
    for (const s of ALL) bySlug.set(s.slug, s.adultPrice);
    for (const b of BALLOON_PACKAGES) bySlug.set(b.slug, b.adultPrice);
    for (const [slug, price] of Object.entries(FROM_PRICES)) {
      expect(bySlug.get(slug), slug).toBe(price);
    }
  });

  it("packages and hotels carry no public price (priceOnRequest)", () => {
    for (const p of [...PACKAGES, ...HOTELS]) expect(p.priceOnRequest, p.slug).toBe(true);
    // Romantic private basket stays on request; standard balloon is a from-price.
    expect(BALLOON_PACKAGES.find((b) => b.slug === "romantik-ozel-balon")?.priceOnRequest).toBe(true);
    expect(BALLOON_PACKAGES.find((b) => b.slug === "standart-balon-ucusu")?.priceOnRequest).toBeFalsy();
  });

  it("sunset tour no longer mentions wine; Green tour includes lunch and the underground city", () => {
    const sunset = TOURS.find((t) => t.slug === "gun-batimi-turu")!;
    const blob = [sunset.shortDescription, ...sunset.includes, ...sunset.highlights].join(" ").toLowerCase();
    expect(blob).not.toMatch(/şarap|wine/);
    const green = TOURS.find((t) => t.slug === "yesil-tur")!;
    expect(green.includes.join(" ")).toMatch(/Öğle yemeği/);
    expect(green.highlights.join(" ")).toMatch(/Yeraltı şehri/);
    expect(TOURS.some((t) => t.slug === "eco-yesil-tur")).toBe(true);
  });

  it("every catalogue slug is translated in every locale (no silent TR fallback)", () => {
    for (const loc of SUPPORTED_LOCALES) {
      if (loc === "tr") continue;
      const d = readJson(`src/data/i18n/data.${loc}.json`);
      const missing = ALL.filter((s) => !(s.slug in d.services)).map((s) => s.slug);
      expect(missing, loc).toEqual([]);
    }
  });

  it("every locale has the from-price template and the ask-price CTA", () => {
    // uiText.ts is a client module (pulls JSX) — inspect it as text: 9 inline locales + 8 JSON.
    const src = fs.readFileSync(path.join(ROOT, "src/lib/i18n/uiText.ts"), "utf8");
    expect(src.match(/fromPrice: "[^"]*\{price\}[^"]*"/g)?.length).toBe(9);
    expect(src.match(/askPrice: "[^"]+"/g)?.length).toBe(9);
    for (const loc of ["pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"]) {
      const ui = readJson(`src/data/i18n/uitext.${loc}.json`);
      expect(ui.serviceCard.fromPrice, loc).toContain("{price}");
      expect(ui.serviceCard.askPrice, loc).toBeTruthy();
    }
    expect(fromPriceShort("tr", 100)).toBe("€100'dan");
    expect(fromPriceShort("en", 100)).toBe("from €100");
  });

  it("WhatsApp CTA carries the product name so Murat sees what was asked", () => {
    const href = buildWhatsAppHref("en", "/en/tours", "Cappadocia Red Tour");
    expect(decodeURIComponent(href)).toContain("Cappadocia Red Tour");
    expect(buildWhatsAppHref("en", "/en/tours")).not.toContain("%F0%9F%8E%88"); // no subject → no 🎈 line
  });

  it("no net legacy prices (€165 / €295 / €215) survive in dictionaries, llms.txt or FAQ data", () => {
    const files = [
      "src/lib/i18n/dictionaries.ts",
      "src/data/faq.ts",
      "src/data/i18n/pageFaqs.ts",
      "src/data/i18n/flyingToday.ts",
      "public/llms.txt",
      "public/llms-full.txt",
      ...SUPPORTED_LOCALES.filter((l) => l !== "tr").map((l) => `src/data/i18n/data.${l}.json`),
      ...["pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"].flatMap((l) => [`public/i18n/dict.${l}.json`, `src/data/i18n/meta.${l}.json`]),
    ];
    for (const f of files) {
      const txt = fs.readFileSync(path.join(ROOT, f), "utf8");
      expect(txt, f).not.toMatch(/€\s?(165|215|295)\b|\b(165|215|295)\s?€/);
    }
  });
});
