import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildWeeklyReport, classifyReferrers } from "@/lib/analytics/weekly-report";

const ROOT = path.resolve(__dirname, "../..");

const summary = {
  days: 7,
  totals: { sessions: 120, pageviews: 300, avg_pageviews: 2.5, bounce_rate: 48.3, avg_session_seconds: 95, whatsapp_sessions: 9, reserve_sessions: 4, booking_deep_sessions: 2, booking_done_sessions: 1, form_sessions: 1 },
  entry_pages: [{ path: "/en/blog/cappadocia-hot-air-balloon-price-2026", sessions: 40, bounce_rate: 70 }, { path: "/", sessions: 30, bounce_rate: 35 }],
  exit_pages: [{ path: "/en/balloon-tours", exits: 25, share: 20.8 }],
  pages: [{ path: "/en/tours", pageviews: 12, avg_scroll: 22, avg_seconds: 9, whatsapp: 0, reserve: 0 }],
  products: [{ product: "standart-balon-ucusu", views: 50, whatsapp: 6, reserve: 3, booking_deep: 2 }],
  dims: {
    locale: [], country: [], device: [],
    referrer: [{ key: "(direct)", sessions: 70 }, { key: "www.google.com", sessions: 20 }, { key: "chatgpt.com", sessions: 15 }, { key: "copilot.microsoft.com", sessions: 5 }, { key: "instagram.com", sessions: 10 }],
  },
  searches: [{ q: "balloon", n: 3 }],
};
const wa = {
  leads: [{ ref: "WA-1" }, { ref: "WA-2" }, { ref: "WA-3" }],
  by_outcome: { sold: 1, open: 2 },
  by_source: [{ source: "ChatGPT / AI", leads: 1, sold: 1, revenue: 400 }],
};

describe("weekly report", () => {
  it("classifies referrers into search / AI / social / direct", () => {
    const c = classifyReferrers(summary.dims.referrer);
    expect(c).toMatchObject({ search: 20, ai: 20, social: 10, direct: 70, other: 0 });
    expect(c.aiHosts).toEqual(["chatgpt.com 15", "copilot.microsoft.com 5"]);
  });

  it("renders funnel, sources, unmarked-lead warning and weak pages in Telegram HTML", () => {
    const text = buildWeeklyReport(summary, wa);
    expect(text).toContain("Oturum <b>120</b>");
    expect(text).toContain("WhatsApp 9 (8%)");
    expect(text).toContain("arama 20 · AI 20 · sosyal 10 · direct 70");
    expect(text).toContain("chatgpt.com 15");
    expect(text).toContain("işaretsiz 2");
    expect(text).toContain("Murat: 2 lead işaretlenmedi");
    expect(text).toContain("ChatGPT / AI 1/1✓ €400");
    expect(text).toContain("/en/blog/cappadocia-hot-air-balloon-pric…");
    expect(text).toContain("Az kaydırılan sayfalar");
    expect(text).toContain("/admin/analiz");
    expect(text.length).toBeLessThan(4096); // Telegram mesaj limiti
  });

  it("survives an empty week and no lead data", () => {
    const empty = { ...summary, totals: {}, entry_pages: [], exit_pages: [], pages: [], products: [], dims: { locale: [], country: [], device: [], referrer: [] }, searches: [] };
    const text = buildWeeklyReport(empty, null);
    expect(text).toContain("Oturum <b>0</b>");
    expect(text).not.toContain("WhatsApp lead");
  });

  it("cron workflow posts to the route with the admin token secret", () => {
    const wf = fs.readFileSync(path.join(ROOT, ".github/workflows/weekly-report.yml"), "utf8");
    expect(wf).toContain("/api/cron/weekly-report");
    expect(wf).toContain("secrets.TRIPANDTICK_ADMIN_API_TOKEN");
    expect(wf).toMatch(/cron: "0 5 \* \* 1"/);
    expect(fs.existsSync(path.join(ROOT, "src/app/api/cron/weekly-report/route.ts"))).toBe(true);
  });

  it("whatsapp-click persists the lead for attribution and the FAB sends sid/product", () => {
    expect(fs.readFileSync(path.join(ROOT, "src/app/api/whatsapp-click/route.ts"), "utf8")).toContain("recordWaLead(");
    const fab = fs.readFileSync(path.join(ROOT, "src/components/booking/WhatsAppFAB.tsx"), "utf8");
    expect(fab).toContain('sessionStorage.getItem("tt:sid")');
    expect(fab).toContain("data-tt-product");
    expect(fs.readFileSync(path.join(ROOT, "src/app/admin/analiz/page.tsx"), "utf8")).toContain("<WaLeads");
  });
});
