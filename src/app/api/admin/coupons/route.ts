// Admin kupon CRUD API — in-memory store, x-admin-token gated.
//
// Importers (client fetch):
//   - src/app/admin/page.tsx (Kuponlar tab)
// Affected: admin kupon yonetimi runtime.
// Data: GET → {ok, coupons: Coupon[]}, POST body Coupon, DELETE ?code=.
//        Auth pattern aynen src/app/api/availability/route.ts:64-74 (env ADMIN_TOKEN
//        veya dev'de "demo-" prefix localStorage token).
// User verbatim: "GET tum kuponlar, POST yeni kupon, DELETE ?code= kupon sil.
// Auth: x-admin-token header (mevcut admin localStorage demo-... token)."

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getAllCoupons,
  upsertCoupon,
  deleteCoupon,
  getCouponByCode,
  type Coupon,
} from "@/data/coupons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

const couponSchema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9]+$/i),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive().max(100000),
  validFrom: z.string().regex(ISO_DATETIME),
  validUntil: z.string().regex(ISO_DATETIME),
  usageLimit: z.number().int().nonnegative().max(1000000),
  usedCount: z.number().int().nonnegative().max(1000000).optional().default(0),
  minPurchase: z.number().nonnegative().max(100000).optional(),
  applicableSlugs: z.array(z.string().max(80)).max(50).optional(),
  active: z.boolean(),
  description: z.string().max(500).optional(),
});

function isAdmin(req: NextRequest): boolean {
  const tokenHeader = req.headers.get("x-admin-token");
  if (!tokenHeader) return false;
  const envToken = process.env.ADMIN_TOKEN;
  if (envToken && tokenHeader === envToken) return true;
  if (process.env.NODE_ENV !== "production" || !envToken) {
    return tokenHeader.startsWith("demo-");
  }
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "Yetkisiz — admin token gerekli (x-admin-token header)" },
      { status: 401 }
    );
  }
  return NextResponse.json({ ok: true, coupons: getAllCoupons() });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "Yetkisiz — admin token gerekli" },
      { status: 401 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input: Coupon = {
    ...parsed.data,
    code: parsed.data.code.toUpperCase(),
    usedCount: parsed.data.usedCount ?? 0,
  };
  const saved = upsertCoupon(input);
  return NextResponse.json({ ok: true, coupon: saved });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "Yetkisiz — admin token gerekli" },
      { status: 401 }
    );
  }
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code parametresi gerekli" }, { status: 400 });
  }
  const existing = getCouponByCode(code);
  if (!existing) {
    return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
  }
  const removed = deleteCoupon(code);
  return NextResponse.json({ ok: removed, code: code.toUpperCase() });
}
