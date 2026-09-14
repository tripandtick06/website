import { describe, it, expect } from "vitest";
import {
  WHATSAPP_NUMBER_E164,
  WHATSAPP_NUMBER_DISPLAY,
  whatsappPrefill,
  buildWhatsAppHref,
  sanitizeSitePath,
} from "@/lib/whatsapp";

describe("lib/whatsapp — prefill", () => {
  it("Turkish locale gets Turkish greeting with diacritics", () => {
    expect(whatsappPrefill("tr")).toBe("Merhaba, Trip and Tick hakkında bilgi almak istiyorum.");
  });

  it("English locale gets English greeting", () => {
    expect(whatsappPrefill("en")).toContain("information about Trip and Tick");
  });

  it("pt-BR shares Portuguese greeting", () => {
    expect(whatsappPrefill("pt-BR")).toBe(whatsappPrefill("pt"));
    expect(whatsappPrefill("pt")).toContain("Trip and Tick");
  });

  it("unknown or empty locale falls back to English", () => {
    expect(whatsappPrefill("xx")).toBe(whatsappPrefill("en"));
    expect(whatsappPrefill("")).toBe(whatsappPrefill("en"));
    expect(whatsappPrefill(undefined)).toBe(whatsappPrefill("en"));
  });
});

describe("lib/whatsapp — sanitizeSitePath", () => {
  it("keeps a normal localized path", () => {
    expect(sanitizeSitePath("/en/balloon-tours/sunrise")).toBe("/en/balloon-tours/sunrise");
  });

  it("strips query string and hash", () => {
    expect(sanitizeSitePath("/en/hotels?x=1#top")).toBe("/en/hotels");
  });

  it("rejects paths not starting with a single slash", () => {
    expect(sanitizeSitePath("//evil.com/x")).toBe("/");
    expect(sanitizeSitePath("https://evil.com")).toBe("/");
    expect(sanitizeSitePath("javascript:alert(1)")).toBe("/");
    expect(sanitizeSitePath("")).toBe("/");
    expect(sanitizeSitePath(undefined)).toBe("/");
  });

  it("caps overlong paths", () => {
    const long = "/" + "a".repeat(600);
    expect(sanitizeSitePath(long).length).toBeLessThanOrEqual(301);
  });
});

describe("lib/whatsapp — buildWhatsAppHref", () => {
  it("targets the Trip and Tick number", () => {
    expect(WHATSAPP_NUMBER_E164).toBe("905374647861");
    expect(WHATSAPP_NUMBER_DISPLAY).toBe("+90 537 464 78 61");
    expect(buildWhatsAppHref("tr", "/")).toMatch(/^https:\/\/wa\.me\/905374647861\?text=/);
  });

  it("encodes greeting + page URL so Murat sees context", () => {
    const href = buildWhatsAppHref("en", "/en/balloon-tours/sunrise");
    const text = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");
    expect(text).toContain("information about Trip and Tick");
    expect(text).toContain("https://tripandtick.com/en/balloon-tours/sunrise");
  });

  it("Turkish greeting survives URL round-trip with diacritics intact", () => {
    const href = buildWhatsAppHref("tr", "/balonlar");
    const text = new URL(href).searchParams.get("text") ?? "";
    expect(text.startsWith("Merhaba, Trip and Tick hakkında bilgi almak istiyorum.")).toBe(true);
  });

  it("unsafe path degrades to homepage, never breaks the href", () => {
    const href = buildWhatsAppHref("en", "//evil.com");
    const text = new URL(href).searchParams.get("text") ?? "";
    expect(text).toContain("https://tripandtick.com/");
    expect(text).not.toContain("evil.com");
  });
});
