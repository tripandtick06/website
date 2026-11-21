// Kilit: tum kanallar (Telegram, mail, DB) dustugunde route 200 DONMEZ (ziyaretci yanlis
// "iletildi" sanmasin) + lead satirlari atif (sid/utm/ref/form) tasir.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  notifyLead: vi.fn(),
  persistLead: vi.fn(),
  persistBooking: vi.fn(),
}));
vi.mock("@/lib/telegram", () => ({ notifyLead: m.notifyLead }));
vi.mock("@/lib/leads", () => ({ persistLead: m.persistLead }));
vi.mock("@/lib/db/bookings", () => ({ persistBooking: m.persistBooking }));
vi.mock("@/lib/db/customers", () => ({ upsertCustomer: vi.fn().mockResolvedValue({ id: "c1" }) }));
vi.mock("@/lib/supabase", () => ({ supabaseEnabled: true, supabaseAdminEnabled: true }));

import { POST as contactPOST } from "@/app/api/contact/route";
import { POST as bookingPOST } from "@/app/api/booking/route";
import { leadAttribution, rememberFirstTouch, sessionId } from "@/lib/analytics/tracker";

const post = (url: string, body: unknown) =>
  new NextRequest(`https://tripandtick.com${url}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const contactBody = { name: "Ada", phone: "+90 555 000 00 00", subject: "Hızlı talep" };
const bookingBody = {
  serviceSlug: "balon",
  serviceName: "Balon",
  date: "2026-12-01",
  adults: 2,
  children: 0,
  totalPrice: 100,
  currency: "EUR",
  passengers: [{ fullName: "Ada Lovelace", email: "a@b.co", phone: "+905550000000", nationality: "TR" }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  m.notifyLead.mockResolvedValue({ ok: false });
  m.persistLead.mockResolvedValue(false);
  m.persistBooking.mockRejectedValue(new Error("db down"));
});

describe("POST /api/contact — all sinks failed", () => {
  it("returns 502 with an error body when Telegram, mail and DB all fail", async () => {
    const res = await contactPOST(post("/api/contact", contactBody));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBeTruthy();
  });

  it("keeps 200 when any single sink succeeds", async () => {
    m.persistLead.mockResolvedValue(true);
    expect((await contactPOST(post("/api/contact", contactBody))).status).toBe(200);
    m.persistLead.mockResolvedValue(false);
    m.notifyLead.mockResolvedValue({ ok: true });
    expect((await contactPOST(post("/api/contact", contactBody))).status).toBe(200);
  });

  it("stores attribution in the lead payload and drops invalid values instead of rejecting", async () => {
    m.persistLead.mockResolvedValue(true);
    const res = await contactPOST(
      post("/api/contact", { ...contactBody, sid: "abc123", utm_source: "google", gclid: "x".repeat(500), form: "quick" }),
    );
    expect(res.status).toBe(200);
    const payload = m.persistLead.mock.calls[0][0].payload;
    expect(payload).toMatchObject({ sid: "abc123", utm_source: "google", form: "quick" });
    expect(payload).not.toHaveProperty("gclid");
  });
});

describe("POST /api/booking — all sinks failed + lead row", () => {
  it("returns 502 with an error body when booking persist, lead persist, Telegram and mail all fail", async () => {
    const res = await bookingPOST(post("/api/booking", bookingBody));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBeTruthy();
  });

  it("writes a leads row with source 'booking' + attribution, and stays 200 if only the lead persisted", async () => {
    m.persistLead.mockResolvedValue(true);
    const res = await bookingPOST(post("/api/booking", { ...bookingBody, sid: "s1", utm_campaign: "winter", form: "booking" }));
    expect(res.status).toBe(200);
    const lead = m.persistLead.mock.calls[0][0];
    expect(lead.source).toBe("booking");
    expect(lead.payload).toMatchObject({ sid: "s1", utm_campaign: "winter", form: "booking" });
  });

  it("stays 200 when only the booking persist succeeded", async () => {
    m.persistBooking.mockResolvedValue("TT-X");
    expect((await bookingPOST(post("/api/booking", bookingBody))).status).toBe(200);
  });
});

describe("leadAttribution (reuses tracker session + first-touch)", () => {
  const mem = () => {
    const d: Record<string, string> = {};
    return { get: (k: string) => d[k] ?? null, set: (k: string, v: string) => void (d[k] = v) };
  };

  it("returns the tracker sid, first-touch utm/click ids, referrer host and the form location", () => {
    const s = mem();
    const { sid } = sessionId(1_000, s);
    rememberFirstTouch("?utm_source=google&utm_medium=cpc&utm_campaign=c1&gclid=G1&fbclid=F1&utm_term=skip", "news.example.com", s);
    expect(leadAttribution("quick", s, 2_000)).toEqual({
      sid,
      form: "quick",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "c1",
      gclid: "G1",
      fbclid: "F1",
      ref_host: "news.example.com",
    });
  });

  it("only sid + form when there is no first-touch data", () => {
    const s = mem();
    sessionId(1_000, s);
    expect(Object.keys(leadAttribution("hotel", s, 2_000)).sort()).toEqual(["form", "sid"]);
  });
});
