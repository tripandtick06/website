import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Karar bloğu kilidi (2026-09-16): hizmet detayında fiyatın yanında WhatsApp CTA'sı ve
// güven satırı (iade / sigorta / TÜRSAB) durur; highlight chip'leri geri gelmez
// (includes listesiyle tekrar ediyordu). Balon sayfasında soru = tek tık WhatsApp,
// /iletisim ara adımı yok.
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("service detail decision block", () => {
  const detail = read("src/components/layout/ServiceDetailContent.tsx");
  const balon = read("src/app/[locale]/balonlar/[slug]/BalonDetayContent.tsx");

  it("shared detail page has WhatsApp CTA + trust row next to the price", () => {
    expect(detail).toContain("<WhatsAppAskLink");
    expect(detail).toContain("t.hero_trust.refund");
    expect(detail).toContain("t.hero_trust.tursab");
  });

  it("highlight chips stay removed (duplicate of includes)", () => {
    expect(detail).not.toContain("item.highlights.map");
  });

  it("balloon page asks via WhatsApp directly, not via /iletisim", () => {
    expect(balon).toContain("<WhatsAppAskLink");
    expect(balon).not.toContain('href="/iletisim"');
  });

  it("video button is icon-only (no visible label text in ServiceVideo)", () => {
    const video = read("src/components/media/ServiceVideo.tsx");
    expect(video).not.toContain("<span>{muted");
    expect(video).toContain("aria-label={muted ? onLabel : offLabel}");
  });
});
