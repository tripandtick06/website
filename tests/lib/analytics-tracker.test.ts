import { describe, it, expect, vi } from "vitest";
import {
  EventQueue,
  SESSION_IDLE_MS,
  classifyClick,
  nextSeq,
  referrerHost,
  scrollDepth,
  sessionId,
  utmProps,
  type Transport,
} from "@/lib/analytics/tracker";
import { deviceOf, isBotUA, cleanPath, visitorHash } from "@/lib/analytics/events";

function memStore() {
  const m: Record<string, string> = {};
  return { get: (k: string) => m[k] ?? null, set: (k: string, v: string) => void (m[k] = v), m };
}

describe("session (sessionStorage, no cookie)", () => {
  it("creates a session, keeps it while active, rotates after 30 min idle", () => {
    const s = memStore();
    const a = sessionId(1_000_000, s);
    expect(a.isNew).toBe(true);
    expect(a.sid).toMatch(/^[0-9a-f]{16}$/);
    const b = sessionId(1_000_000 + 5 * 60_000, s);
    expect(b).toEqual({ sid: a.sid, isNew: false });
    const c = sessionId(1_000_000 + 5 * 60_000 + SESSION_IDLE_MS + 1, s);
    expect(c.isNew).toBe(true);
    expect(c.sid).not.toBe(a.sid);
  });

  it("seq counts page views within the session and resets on a new session", () => {
    const s = memStore();
    sessionId(1, s);
    expect(nextSeq(s)).toBe(1);
    expect(nextSeq(s)).toBe(2);
    sessionId(1 + SESSION_IDLE_MS + 1, s);
    expect(nextSeq(s)).toBe(1);
  });
});

describe("referrer / utm", () => {
  it("keeps only external hosts and only on the first page of a session", () => {
    expect(referrerHost("https://www.google.com/search?q=x", "tripandtick.com", true)).toBe("www.google.com");
    expect(referrerHost("https://tripandtick.com/en", "tripandtick.com", true)).toBeNull();
    expect(referrerHost("https://www.google.com/", "tripandtick.com", false)).toBeNull();
    expect(referrerHost("", "tripandtick.com", true)).toBeNull();
    expect(referrerHost("not a url", "tripandtick.com", true)).toBeNull();
  });

  it("extracts utm params only", () => {
    expect(utmProps("?utm_source=ig&utm_medium=bio&foo=bar&gclid=abc")).toEqual({ utm_source: "ig", utm_medium: "bio", gclid: "abc" });
    expect(utmProps("")).toEqual({});
  });
});

describe("click classification", () => {
  const el = (attrs: Record<string, string>) => ({ getAttribute: (n: string) => attrs[n] ?? null });
  it("recognises WhatsApp, tel, mail, reserve and outbound links; ignores internal ones", () => {
    expect(classifyClick(el({ href: "https://wa.me/905374647861?text=hi" }), "tripandtick.com")?.kind).toBe("whatsapp");
    expect(classifyClick(el({ href: "tel:+905374647861" }), "tripandtick.com")?.kind).toBe("tel");
    expect(classifyClick(el({ href: "mailto:info@tripandtick.com" }), "tripandtick.com")?.kind).toBe("mail");
    expect(classifyClick(el({ href: "/rezervasyon/standart-balon-ucusu" }), "tripandtick.com")?.kind).toBe("reserve");
    expect(classifyClick(el({ href: "https://royalballoon.com" }), "tripandtick.com")).toMatchObject({ kind: "outbound", href: "royalballoon.com" });
    expect(classifyClick(el({ href: "/en/tours" }), "tripandtick.com")).toBeNull();
    expect(classifyClick(el({ href: "https://tripandtick.com/en/tours" }), "tripandtick.com")).toBeNull();
  });
  it("data-track wins over href", () => {
    expect(classifyClick(el({ href: "/en/tours", "data-track": "track", "data-track-label": "hero-cta" }), "tripandtick.com")).toMatchObject({ kind: "track", label: "hero-cta" });
  });
});

describe("scroll depth", () => {
  it("is 100 on short pages and clamps to 0..100", () => {
    expect(scrollDepth(0, 800, 700)).toBe(100);
    expect(scrollDepth(0, 800, 4000)).toBe(20);
    expect(scrollDepth(3200, 800, 4000)).toBe(100);
    expect(scrollDepth(99999, 800, 4000)).toBe(100);
  });
});

describe("queue", () => {
  function transport() {
    const sent: { via: string; body: string }[] = [];
    const t: Transport = { beacon: (b) => (sent.push({ via: "beacon", body: b }), true), fetch: (b) => void sent.push({ via: "fetch", body: b }) };
    return { t, sent };
  }
  const e = (seq: number) => ({ name: "page_view" as const, path: "/", sid: "abcdef0123456789", seq, props: {} });

  it("flushes on size, on timer and via beacon on unload", () => {
    vi.useFakeTimers();
    const { t, sent } = transport();
    const q = new EventQueue(t, 5000, 3);
    q.push(e(1));
    q.push(e(2));
    expect(sent).toHaveLength(0);
    q.push(e(3));
    expect(sent).toHaveLength(1);
    expect(JSON.parse(sent[0].body).events).toHaveLength(3);
    q.push(e(4));
    vi.advanceTimersByTime(5001);
    expect(sent).toHaveLength(2);
    q.push(e(5));
    q.flush(true);
    expect(sent[2].via).toBe("beacon");
    expect(q.size()).toBe(0);
    vi.useRealTimers();
  });

  it("splits oversized batches to the server maximum (25)", () => {
    const { t, sent } = transport();
    const q = new EventQueue(t, 60_000, 1000);
    for (let i = 1; i <= 30; i++) q.push(e(i));
    q.flush();
    expect(sent.map((s) => JSON.parse(s.body).events.length)).toEqual([25, 5]);
  });
});

describe("server helpers", () => {
  it("bot UA / device / path", () => {
    expect(isBotUA("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true);
    expect(isBotUA("Mozilla/5.0 (Windows NT 10.0) Chrome/128")).toBe(false);
    expect(deviceOf("Mozilla/5.0 (iPhone) Mobile Safari")).toBe("mobile");
    expect(deviceOf("Mozilla/5.0 (iPad; CPU OS 17) Safari")).toBe("tablet");
    expect(deviceOf("Mozilla/5.0 (Windows NT 10.0) Chrome/128")).toBe("desktop");
    expect(cleanPath("/tr/balonlar?x#y")).toBe("/tr/balonlar");
    expect(cleanPath("javascript:alert(1)")).toBe("/");
  });

  it("visitor hash rotates daily and never contains the IP", async () => {
    const d1 = new Date("2026-09-18T10:00:00Z");
    const d2 = new Date("2026-09-19T10:00:00Z");
    const a = await visitorHash("203.0.113.7", "UA", "salt", d1);
    const b = await visitorHash("203.0.113.7", "UA", "salt", d1);
    const c = await visitorHash("203.0.113.7", "UA", "salt", d2);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(a).not.toContain("203");
  });
});
