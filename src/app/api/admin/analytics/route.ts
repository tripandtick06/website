import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "@/lib/admin-auth";
import { analyticsPrune, analyticsSummary } from "@/lib/analytics/events";

// Davranış özeti (admin). Caller: src/app/admin/analiz/page.tsx (same-origin fetch,
// httpOnly admin cookie) veya AGA/cron (x-admin-token = ADMIN_API_TOKEN).
// Bilerek `isAdmin()`'in "demo-" prefix kısayolu YOK: prod'da ADMIN_TOKEN env
// tanımlı olmadığından o kısayol herkese açık kapı demek.
// Data: GET ?days=7|30|90 → analytics_summary(p_days) jsonb (0006_events.sql).

export const runtime = "edge";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminCookieValue(cookie)) return true;
  const header = req.headers.get("x-admin-token") ?? undefined;
  return verifyAdminCookieValue(header);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const raw = Number(req.nextUrl.searchParams.get("days") ?? 7);
  const days = Number.isFinite(raw) ? Math.min(90, Math.max(1, Math.round(raw))) : 7;
  try {
    const summary = await analyticsSummary(days);
    if (summary === null) {
      return NextResponse.json({ error: "Supabase yapılandırılmamış" }, { status: 503 });
    }
    // Opportunistik temizlik — cevabı bekletmez.
    void analyticsPrune();
    return NextResponse.json({ ok: true, summary }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[api/admin/analytics]", err);
    return NextResponse.json({ error: "Özet alınamadı" }, { status: 502 });
  }
}
