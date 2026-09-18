import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { analyticsSummary, waLeadList } from "@/lib/analytics/events";
import { buildWeeklyReport, type SummaryLike, type WaListLike } from "@/lib/analytics/weekly-report";
import { sendTelegramText } from "@/lib/telegram";

// Haftalık davranış raporu → Telegram. Tetik: .github/workflows/weekly-report.yml
// (Pazartesi 08:00 TR) veya elle. Auth: x-admin-token = ADMIN_API_TOKEN.
// ?days=7 (1-90) · ?dry=1 → Telegram'a göndermeden metni döndür.
// Rapor loop'a dönüşür: panele girmeden haftalık gerçek sayı + işaretsiz lead uyarısı.

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const raw = Number(req.nextUrl.searchParams.get("days") ?? 7);
  const days = Number.isFinite(raw) ? Math.min(90, Math.max(1, Math.round(raw))) : 7;
  const dry = req.nextUrl.searchParams.get("dry") === "1";
  try {
    const [summary, wa] = await Promise.all([
      analyticsSummary(days) as Promise<SummaryLike | null>,
      waLeadList(Math.max(days, 30)).catch(() => null) as Promise<WaListLike | null>,
    ]);
    if (!summary) return NextResponse.json({ error: "Analytics yapılandırılmamış" }, { status: 503 });
    const text = buildWeeklyReport(summary, wa, { siteUrl: process.env.NEXT_PUBLIC_SITE_URL });
    if (dry) return NextResponse.json({ ok: true, text });
    const tg = await sendTelegramText(text);
    return NextResponse.json({ ok: tg.ok, sent: tg.sent, failed: tg.failed, chars: text.length });
  } catch (err) {
    console.error("[api/cron/weekly-report]", err);
    return NextResponse.json({ error: "Rapor üretilemedi" }, { status: 502 });
  }
}
