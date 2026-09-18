import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-auth";
import { WA_OUTCOMES, waLeadList, waLeadOutcome } from "@/lib/analytics/events";

// WhatsApp lead atıf döngüsü (admin). Caller: src/app/admin/analiz/page.tsx.
// GET ?days=30 → { leads[], by_outcome, by_source, by_product }
// POST { ref, outcome, source?, amountEur?, note? } → sonucu işaretle.
// Auth: admin cookie veya x-admin-token = ADMIN_API_TOKEN (isAdminRequest).

export const runtime = "edge";
export const dynamic = "force-dynamic";

const outcomeSchema = z.object({
  ref: z.string().regex(/^WA-[A-Z0-9]{6,20}$/),
  outcome: z.enum(WA_OUTCOMES),
  source: z.string().max(60).optional().nullable(),
  amountEur: z.number().nonnegative().max(100000).optional().nullable(),
  note: z.string().max(300).optional().nullable(),
});

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const raw = Number(req.nextUrl.searchParams.get("days") ?? 30);
  const days = Number.isFinite(raw) ? Math.min(365, Math.max(1, Math.round(raw))) : 30;
  try {
    const data = await waLeadList(days);
    if (data === null) return NextResponse.json({ error: "Analytics yapılandırılmamış" }, { status: 503 });
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[api/admin/wa-leads GET]", err);
    return NextResponse.json({ error: "Liste alınamadı" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  const parsed = outcomeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  try {
    const found = await waLeadOutcome({ ...parsed.data, by: "admin" });
    if (!found) return NextResponse.json({ error: "Lead bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/wa-leads POST]", err);
    return NextResponse.json({ error: "Kaydedilemedi" }, { status: 502 });
  }
}
