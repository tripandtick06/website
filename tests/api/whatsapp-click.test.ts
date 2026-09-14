import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const notifyLeadMock = vi.fn();

vi.mock("@/lib/telegram", () => ({
  notifyLead: (...args: unknown[]) => notifyLeadMock(...args),
}));

beforeEach(() => {
  notifyLeadMock.mockReset();
  notifyLeadMock.mockResolvedValue({ ok: true, sent: 2, failed: 0 });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

function buildReq(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://tripandtick.com/api/whatsapp-click", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cf-connecting-ip": "10.0.0.1",
      "user-agent": "Mozilla/5.0 (Linux; Android 14) Mobile Safari/537.36",
      "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
      "cf-ipcountry": "BR",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/whatsapp-click", () => {
  it("notifies Telegram with page, locale, country and device", async () => {
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(buildReq({ path: "/en/balloon-tours/sunrise", locale: "en" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.ref).toMatch(/^WA-/);
    expect(json.notified.telegram).toBe(true);

    expect(notifyLeadMock).toHaveBeenCalledTimes(1);
    const arg = notifyLeadMock.mock.calls[0][0] as {
      source: string;
      title: string;
      fields: [string, unknown][];
      note?: string;
    };
    expect(arg.source).toBe("whatsapp");
    const fields = Object.fromEntries(arg.fields);
    expect(fields["Sayfa"]).toBe("https://tripandtick.com/en/balloon-tours/sunrise");
    expect(fields["Site dili"]).toBe("en");
    expect(fields["Ülke"]).toBe("BR");
    expect(fields["Tarayıcı dili"]).toBe("pt-BR");
    expect(fields["Cihaz"]).toBe("mobil");
    expect(String(fields["Saat (TR)"])).toMatch(/\d{2}:\d{2}/);
    // Murat needs to know the message lands on his phone, not in Telegram.
    expect(arg.note).toContain("+90 537 464 78 61");
  });

  it("returns 200 without notifying when honeypot is filled", async () => {
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(buildReq({ path: "/", locale: "tr", _hp: "spam" }));
    expect(res.status).toBe(200);
    expect(notifyLeadMock).not.toHaveBeenCalled();
  });

  it("skips crawler user-agents silently", async () => {
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(
      buildReq({ path: "/", locale: "tr" }, { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.skipped).toBe("bot");
    expect(notifyLeadMock).not.toHaveBeenCalled();
  });

  it("rejects malformed body with 400", async () => {
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(buildReq({ locale: "tr" }));
    expect(res.status).toBe(400);
    expect(notifyLeadMock).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(buildReq("{not json"));
    expect(res.status).toBe(400);
  });

  it("sanitizes hostile path and still notifies", async () => {
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(buildReq({ path: "//evil.com/phish", locale: "en" }));
    expect(res.status).toBe(200);
    const arg = notifyLeadMock.mock.calls[0][0] as { fields: [string, unknown][] };
    const fields = Object.fromEntries(arg.fields);
    expect(fields["Sayfa"]).toBe("https://tripandtick.com/");
  });

  it("still returns 200 when Telegram delivery fails (never blocks the customer)", async () => {
    notifyLeadMock.mockResolvedValue({ ok: false, sent: 0, failed: 2, errors: ["HTTP 500"] });
    const { POST } = await import("@/app/api/whatsapp-click/route");
    const res = await POST(buildReq({ path: "/", locale: "tr" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notified.telegram).toBe(false);
  });
});
