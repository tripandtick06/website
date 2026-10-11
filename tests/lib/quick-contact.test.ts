// Kilit: owner kurali (2026-10-11) — HER sayfada ustte form + WhatsApp + e-posta.
// Bu testler, uc aksiyonun paylasilan layout'tan (Header/PageHero/HeroSection) cikmasini,
// ikinci bir WhatsApp FAB'in geri gelmesini ve 17 dilden birinde ceviri eksigini YAKALAR.
import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

vi.mock("@/lib/telegram", () => ({ notifyLead: vi.fn().mockResolvedValue({ ok: true }) }));
vi.mock("@/lib/leads", () => ({ persistLead: vi.fn().mockResolvedValue(true) }));

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur", "pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"];
const KEYS = ["title", "subtitle", "name", "phone", "email", "needOne", "date", "people", "message", "more", "send", "sending", "success", "error", "formBtn", "mail", "close"];
const INLINE = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"];

describe("quick contact — shared layout wiring", () => {
  it("Header renders the actions on every page", () => {
    expect(read("src/components/layout/Header.tsx")).toContain("<QuickContactHeader />");
  });

  it("hero templates carry the card (home + PageHero), /iletisim reuses its own form via the same id", () => {
    expect(read("src/components/layout/PageHero.tsx")).toContain("<QuickContactCard");
    expect(read("src/components/sections/HeroSection.tsx")).toContain("<QuickContactCard");
    const iletisim = read("src/app/[locale]/iletisim/IletisimContent.tsx");
    expect(iletisim).toContain("contactCard={false}");
    expect(iletisim).toContain('id="quick-contact"');
  });

  it("header actions = form + WhatsApp (attributed) + mailto, all from repo data", () => {
    const src = read("src/components/booking/QuickContact.tsx");
    expect(src).toContain("buildWhatsAppHref(");
    expect(src).toContain("reportClick(");
    expect(src).toContain("mailto:${COMPANY.email}");
    expect(src).toContain('fetch("/api/contact"'); // reuse existing lead pipeline, no new endpoint
    expect(src).toContain('name="_hp"'); // honeypot kept
    expect(read("src/data/founder.ts")).toContain('email: "info@tripandtick.com"');
    expect(read("src/lib/whatsapp.ts")).toContain('WHATSAPP_NUMBER_E164 = "905374647861"');
  });

  it("no second WhatsApp: floating FAB is not mounted anywhere", () => {
    expect(read("src/app/[locale]/layout.tsx")).not.toMatch(/<WhatsAppFAB\b/);
    expect(read("src/components/booking/WhatsAppFAB.tsx")).not.toMatch(/export function WhatsAppFAB\b/);
  });
});

describe("quick contact — all 17 locales carry every string", () => {
  it("JSON locales", () => {
    for (const l of LOCALES.filter((x) => !INLINE.includes(x))) {
      const d = JSON.parse(read(`src/data/i18n/uitext.${l}.json`)).quickContact;
      for (const k of KEYS) expect(d?.[k], `${l}.${k}`).toBeTruthy();
    }
  });

  it("inline locales (uiText.ts) — one complete block each, translated (not the English copy)", () => {
    const src = read("src/lib/i18n/uiText.ts").replace(/\r\n/g, "\n");
    const blocks = [...src.matchAll(/\n    quickContact: \{\n([\s\S]*?)\n    \},/g)].map((m) => m[1]);
    expect(blocks).toHaveLength(INLINE.length);
    const parsed = blocks.map((b) => Object.fromEntries([...b.matchAll(/^\s+(\w+): "(.*)",?$/gm)].map((m) => [m[1], m[2]])));
    const en = parsed[INLINE.indexOf("en")];
    parsed.forEach((p, i) => {
      for (const k of KEYS) expect(p[k], `${INLINE[i]}.${k}`).toBeTruthy();
      if (INLINE[i] !== "en") expect(p.send, `${INLINE[i]} send not translated`).not.toBe(en.send);
    });
  });

  it("no net price leaks into the new strings", () => {
    const src = read("src/lib/i18n/uiText.ts");
    const all = [...src.matchAll(/quickContact: \{[\s\S]*?\n    \},/g)].map((m) => m[0]).join("\n");
    expect(all).not.toMatch(/[€$£]\s?\d|\d\s?(€|EUR|TRY|TL)/);
  });
});

describe("POST /api/contact — quick form contract", () => {
  const req = (body: unknown) =>
    new NextRequest("https://tripandtick.com/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  it("accepts phone-only (no e-mail, no message)", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(req({ name: "Ada", phone: "+90 555 000 00 00", subject: "Hızlı talep" }));
    expect(res.status).toBe(200);
  });

  it("rejects when neither phone nor e-mail is given", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(req({ name: "Ada", subject: "Hızlı talep" }));
    expect(res.status).toBe(400);
  });

  it("existing /iletisim payload (e-mail + message) still passes", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(req({ name: "Ada", email: "a@b.co", subject: "bilgi", message: "Merhaba, bilgi alabilir miyim?" }));
    expect(res.status).toBe(200);
  });
});
