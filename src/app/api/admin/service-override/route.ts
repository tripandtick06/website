// /api/admin/service-override — admin gunluk fiyat + iptal/rotar yonetimi.
//
// Importers (callers):
//   - src/app/admin/fiyat/page.tsx (admin UI)
//   - src/app/admin/iptal/page.tsx (toplu hava iptal — planli)
// Affected: service_overrides tablo CRUD + toplu iptal.
// Auth: x-admin-token header ADMIN_API_TOKEN env eslesme.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getOverride,
  listOverrides,
  upsertOverride,
  deleteOverride,
  bulkCancel,
} from "@/lib/db/service-overrides";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? "demo-admin-token-rotate-me";

function authorized(req: NextRequest): boolean {
  const tok = req.headers.get("x-admin-token");
  if (!tok) return false;
  return tok === ADMIN_TOKEN;
}

const upsertSchema = z.object({
  slug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priceOverride: z.number().nonnegative().max(100000).nullable().optional(),
  currency: z.enum(["EUR", "TRY", "USD"]).optional(),
  status: z.enum(["active", "cancelled", "delayed", "sold_out"]).optional(),
  cancellationReason: z.string().max(500).nullable().optional(),
  delayMinutes: z.number().int().min(0).max(720).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  updatedBy: z.string().max(120).optional(),
});

const bulkCancelSchema = z.object({
  mode: z.literal("bulk-cancel"),
  slugs: z.array(z.string().min(1)).min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(2).max(500),
  updatedBy: z.string().max(120).optional(),
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

  if (body && typeof body === "object" && (body as { mode?: string }).mode === "bulk-cancel") {
    const parsed = bulkCancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Gecersiz bulk-cancel verisi", details: parsed.error.flatten() }, { status: 400 });
    }
    const results = await bulkCancel(parsed.data);
    return NextResponse.json({ ok: true, count: results.length, results });
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz veri", details: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, date, ...patch } = parsed.data;
  try {
    const result = await upsertOverride(slug, date, patch);
    return NextResponse.json({ ok: true, override: result });
  } catch (err) {
    console.error("[api/admin/service-override] POST failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Bilinmeyen hata" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? undefined;
  const date = url.searchParams.get("date") ?? undefined;
  const startDate = url.searchParams.get("startDate") ?? undefined;
  const endDate = url.searchParams.get("endDate") ?? undefined;

  if (slug && date) {
    const o = await getOverride(slug, date);
    return NextResponse.json({ override: o });
  }
  const arr = await listOverrides({ slug, startDate, endDate });
  return NextResponse.json({ overrides: arr, count: arr.length });
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const date = url.searchParams.get("date") ?? "";
  if (!slug || !date) {
    return NextResponse.json({ error: "slug ve date zorunlu" }, { status: 400 });
  }
  try {
    await deleteOverride(slug, date);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/service-override] DELETE failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Hata" }, { status: 500 });
  }
}
