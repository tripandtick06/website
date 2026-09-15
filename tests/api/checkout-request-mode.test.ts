import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// 2026-09-16: without STRIPE_SECRET_KEY the checkout used to send real
// customers to "/rezervasyon/basarili?demo=1" — a page titled "TEST / DEMO
// MODE — no real booking was created" — and notified nobody. It is now
// *request mode*: the client posts the booking (Telegram) and the success
// page says "request received, we confirm and send the payment link".
vi.mock("@/lib/pricing", () => ({
  computeServerTotal: vi.fn(async () => ({ ok: true, serverTotal: 330, override: null })),
}));

import { POST } from "@/app/api/checkout/route";

function buildReq(body: unknown): NextRequest {
  return new NextRequest("https://tripandtick.com/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout without Stripe = request mode", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
  });

  it("returns request:true and a success URL flagged request=1 (never demo=1)", async () => {
    const res = await POST(
      buildReq({
        serviceSlug: "standart-balon-ucusu",
        serviceName: "Standart Balon Uçuşu",
        date: "2026-10-20",
        adults: 2,
        children: 0,
        currency: "EUR",
        customerEmail: "probe@example.com",
        locale: "en",
      })
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { url: string; request?: boolean; demo?: boolean };
    expect(data.request).toBe(true);
    expect(data.url).toContain("/en/rezervasyon/basarili?request=1");
    expect(data.url).not.toContain("demo=1");
  });

  it("success page copy no longer calls it a test/demo (17 locales)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const root = path.resolve(__dirname, "../..");
    const dict = fs.readFileSync(path.join(root, "src/lib/i18n/dictionaries.ts"), "utf8");
    const demoBadges = [...dict.matchAll(/demo_badge: "([^"]+)"/g)].map((m) => m[1]);
    expect(demoBadges.length).toBe(9);
    for (const b of demoBadges) expect(b).not.toMatch(/demo|test/i);
    for (const loc of ["pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az"]) {
      const d = JSON.parse(fs.readFileSync(path.join(root, `public/i18n/dict.${loc}.json`), "utf8"));
      expect(d.component.rezervasyon.success_client.demo_badge, loc).not.toMatch(/demo|test|デモ|테스트|демо|тест/i);
    }
  });
});
