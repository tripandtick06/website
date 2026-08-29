// /api/admin/reschedule — Q3 Balon borsasi: bulk-cancel sonrasi alt-tarih / refund
// magic-link batch e-posta gonderim + preview.
//
// Importers (callers):
//   - src/app/admin/fiyat/page.tsx (preview + send button)
// Auth: x-admin-token header ADMIN_API_TOKEN env eslesme.
//
// Modes:
//   - preview: { mode:"preview", slugs[], date } -> impactedBookings + alternativeDates
//   - send   : { mode:"send", slugs[], date, cancellationReason } -> Brevo batch + magic-link

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { findImpactedBookings } from "@/lib/db/bookings";
import { sendCancellationNotifications, enrichWithAlternatives } from "@/lib/cancel-notify";
import { brevoEnabled } from "@/lib/brevo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? "demo-admin-token-rotate-me";

function authorized(req: NextRequest): boolean {
  const tok = req.headers.get("x-admin-token");
  return Boolean(tok) && tok === ADMIN_TOKEN;
}

const previewSchema = z.object({
  mode: z.literal("preview"),
  slugs: z.array(z.string().min(1)).min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const sendSchema = z.object({
  mode: z.literal("send"),
  slugs: z.array(z.string().min(1)).min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cancellationReason: z.string().min(2).max(500).optional(),
  locale: z.string().min(2).max(8).optional(),
});

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON parse hatasi" }, { status: 400 });
  }

  const mode = (body as { mode?: string })?.mode;

  if (mode === "preview") {
    const parsed = previewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz preview verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const impacted = await findImpactedBookings({
      slugs: parsed.data.slugs,
      date: parsed.data.date,
    });
    const enriched = await enrichWithAlternatives(impacted);
    return NextResponse.json({
      ok: true,
      mode: "preview",
      count: enriched.length,
      totalPax: enriched.reduce((sum, b) => sum + b.pax, 0),
      totalRefund: enriched.reduce((sum, b) => sum + b.total, 0),
      currency: enriched[0]?.currency ?? "EUR",
      bookings: enriched,
    });
  }

  if (mode === "send") {
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz send verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await sendCancellationNotifications({
      slugs: parsed.data.slugs,
      date: parsed.data.date,
      cancellationReason: parsed.data.cancellationReason,
      locale: parsed.data.locale,
    });
    if (result.impactedCount === 0) {
      return NextResponse.json({
        ok: true,
        mode: "send",
        count: 0,
        sent: 0,
        message: "Etkilenen rezervasyon yok.",
      });
    }
    return NextResponse.json({
      ok: true,
      mode: "send",
      brevoEnabled: brevoEnabled(),
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      demoLogged: result.demoLogged,
      impactedCount: result.impactedCount,
      skippedNoEmail: result.skippedNoEmail,
    });
  }

  return NextResponse.json({ error: "mode 'preview' veya 'send' olmali" }, { status: 400 });
}
