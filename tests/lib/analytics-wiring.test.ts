import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Ölçüm katmanı bağlamaları: bir dosya iyi niyetle geri alınırsa ölçüm sessizce ölür
// (sessiz kayıp = en pahalı hata). Bu test o kabloları kilitler.
const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("behaviour analytics wiring", () => {
  it("Tracker is mounted inside the locale providers", () => {
    const layout = read("src/app/[locale]/layout.tsx");
    expect(layout).toContain('import { Tracker } from "@/components/analytics/Tracker"');
    const idx = layout.indexOf("<Tracker />");
    expect(idx).toBeGreaterThan(layout.indexOf("<I18nProvider"));
    expect(idx).toBeLessThan(layout.indexOf("</I18nProvider>"));
  });

  it("/api/event is rate-limited with its own (wider) bucket", () => {
    const mw = read("src/middleware.ts");
    expect(mw).toMatch(/pathname\.startsWith\("\/api\/event"\)/);
    expect(mw).toMatch(/const EVENT_MAX = (\d+)/);
    const max = Number(mw.match(/const EVENT_MAX = (\d+)/)![1]);
    expect(max).toBeGreaterThanOrEqual(30);
  });

  it("detail pages expose the product slug for product-level funnels", () => {
    expect(read("src/components/layout/ServiceDetailContent.tsx")).toContain("data-tt-product={item.slug}");
    expect(read("src/app/[locale]/balonlar/[slug]/BalonDetayContent.tsx")).toContain("data-tt-product={pkg.slug}");
    expect(read("src/app/[locale]/oteller/[slug]/OtelDetayContent.tsx")).toContain("data-tt-product={hotel.slug}");
  });

  it("booking steps and searches are tracked", () => {
    expect(read("src/app/[locale]/rezervasyon/[slug]/BookingClient.tsx")).toContain('track("booking_step"');
    expect(read("src/components/booking/SearchWidget.tsx")).toContain('track("search"');
  });

  it("admin analytics API never accepts the demo- token shortcut", () => {
    const route = read("src/app/api/admin/analytics/route.ts");
    expect(route).not.toContain('startsWith("demo-")');
    expect(route).toContain("verifyAdminCookieValue");
  });

  it("migration defines the events table and the summary/prune functions; admin nav links the page", () => {
    const sql = read("supabase/migrations/0006_events.sql");
    expect(sql).toContain("create table if not exists public.events");
    expect(sql).toContain("function public.analytics_summary");
    expect(sql).toContain("function public.analytics_prune");
    expect(sql).toContain("enable row level security");
    expect(read("src/app/admin/AdminShell.tsx")).toContain('href: "/admin/analiz"');
    expect(fs.existsSync(path.join(ROOT, "src/app/admin/analiz/page.tsx"))).toBe(true);
  });

  it("keep-alive workflow pings health twice a day and checks the Supabase ping key", () => {
    const wf = read(".github/workflows/supabase-keepalive.yml");
    expect(wf).toMatch(/cron: "\d+ [\d,]+ \* \* \*"/);
    expect(wf).toContain('"supabasePing":"ok"');
    expect(read("src/app/api/health/route.ts")).toContain("supabasePing");
  });
});
