import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// /api/event: doğrula → bot ele → zenginleştir → insertEvents. Supabase fetch mock'lanır.
const insertMock = vi.fn();
vi.mock("@/lib/analytics/events", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics/events")>("@/lib/analytics/events");
  return { ...actual, insertEvents: (...args: unknown[]) => insertMock(...args) };
});

beforeEach(() => {
  insertMock.mockReset();
  insertMock.mockResolvedValue(true);
  vi.spyOn(console, "info").mockImplementation(() => {});
});

const ev = (over: Record<string, unknown> = {}) => ({
  name: "page_view",
  path: "/en/tours/kirmizi-tur",
  sid: "a1b2c3d4e5f60718",
  seq: 1,
  locale: "en",
  props: { title: "Red Tour" },
  ...over,
});

function req(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://tripandtick.com/api/event", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.7",
      "cf-ipcountry": "DE",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/event", () => {
  it("stores a batch enriched with country, device and a daily visitor hash", async () => {
    const { POST } = await import("@/app/api/event/route");
    const res = await POST(req({ events: [ev(), ev({ name: "click", seq: 1, props: { kind: "whatsapp" } })] }));
    expect(res.status).toBe(204);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const rows = insertMock.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ country: "DE", device: "mobile", name: "page_view", path: "/en/tours/kirmizi-tur", sid: "a1b2c3d4e5f60718" });
    expect(rows[0].vhash).toMatch(/^[0-9a-f]{16}$/);
    expect(rows[1].props).toEqual({ kind: "whatsapp" });
  });

  it("drops bot user agents without touching the database", async () => {
    const { POST } = await import("@/app/api/event/route");
    for (const ua of ["Mozilla/5.0 (compatible; Googlebot/2.1)", "GPTBot/1.0", "python-requests/2.31", ""]) {
      const res = await POST(req({ events: [ev()] }, { "user-agent": ua }));
      expect(res.status).toBe(204);
    }
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects malformed batches and honeypot hits", async () => {
    const { POST } = await import("@/app/api/event/route");
    expect((await POST(req("{not json"))).status).toBe(400);
    expect((await POST(req({ events: [] }))).status).toBe(400);
    expect((await POST(req({ events: [ev({ name: "hack" })] }))).status).toBe(400);
    expect((await POST(req({ events: [ev({ sid: "../etc" })] }))).status).toBe(400);
    expect((await POST(req({ events: [ev()], _hp: "spam" }))).status).toBe(204);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("sanitises paths (query/hash stripped, foreign schemes → /)", async () => {
    const { POST } = await import("@/app/api/event/route");
    await POST(req({ events: [ev({ path: "/de/touren?x=1#y" }), ev({ path: "//evil.com/x" })] }));
    const rows = insertMock.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(rows[0].path).toBe("/de/touren");
    expect(rows[1].path).toBe("/");
  });

  it("never lets a storage failure reach the visitor", async () => {
    insertMock.mockResolvedValue(false);
    const { POST } = await import("@/app/api/event/route");
    const res = await POST(req({ events: [ev()] }));
    expect(res.status).toBe(204);
  });
});
