// Availability API — GET (tek gun/aralık) + POST (admin update).
//
// Importers (client fetch):
//   - src/app/rezervasyon/[slug]/BookingClient.tsx (Step 2 doluluk sorgu)
//   - src/app/admin/page.tsx (Takvim tab edit)
// Affected: rezervasyon flow + admin manuel doluluk yonetimi.
// Data: GET response = DayAvailability JSON (status, remainingSlots, totalSlots, note?).
//       POST body = { slug, date YYYY-MM-DD, status?, remainingSlots?, totalSlots?, note? }
//       Auth: x-admin-token header (env ADMIN_TOKEN; demo: localStorage token).
// User verbatim: "doluluk oranlarini bizim elden ayarlayabilmemiz gerekiyor.
// mesela balon turunda veya atv yada at turunda doluluk oldugunda musteriye
// odeme yaptirmadan once bunu bilgilendirebilmemiz gerekiyor. bunun icinde
// elden de ayarlama yapabilmemiz gerekiyor."

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getAvailability,
  getRange,
  loadFromFile,
  setAvailability,
} from "@/lib/availability-store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const querySingleSchema = z.object({
  slug: z.string().min(1).max(80),
  date: z.string().regex(ISO_DATE),
});

const queryRangeSchema = z.object({
  slug: z.string().min(1).max(80),
  from: z.string().regex(ISO_DATE),
  to: z.string().regex(ISO_DATE),
});

const postSchema = z.object({
  slug: z.string().min(1).max(80),
  date: z.string().regex(ISO_DATE),
  status: z.enum(["available", "limited", "full"]).optional(),
  remainingSlots: z.number().int().min(0).max(1000).optional(),
  totalSlots: z.number().int().min(0).max(1000).optional(),
  note: z.string().max(500).optional(),
});

function publicShape(d: ReturnType<typeof getAvailability>) {
  // Client'a totalSlots'u expose etmiyoruz (ozel bilgi);
  // sadece status + remainingSlots + note.
  return {
    date: d.date,
    status: d.status,
    remainingSlots: d.remainingSlots,
    note: d.note,
  };
}

function adminShape(d: ReturnType<typeof getAvailability>) {
  return d;
}

function isAdmin(req: NextRequest): boolean {
  const tokenHeader = req.headers.get("x-admin-token");
  if (!tokenHeader) return false;
  const envToken = process.env.ADMIN_TOKEN;
  if (envToken && tokenHeader === envToken) return true;
  // Demo mode: localStorage "demo-..." token kabul (Faz 2: Supabase Auth).
  if (process.env.NODE_ENV !== "production" || !envToken) {
    return tokenHeader.startsWith("demo-");
  }
  return false;
}

export async function GET(req: NextRequest) {
  await loadFromFile();
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const admin = isAdmin(req);

  if (date) {
    const parsed = querySingleSchema.safeParse({ slug, date });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz parametreler", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const day = getAvailability(parsed.data.slug, parsed.data.date);
    return NextResponse.json({
      ok: true,
      day: admin ? adminShape(day) : publicShape(day),
    });
  }

  if (from && to) {
    const parsed = queryRangeSchema.safeParse({ slug, from, to });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz parametreler", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const days = getRange(parsed.data.slug, parsed.data.from, parsed.data.to);
    return NextResponse.json({
      ok: true,
      days: days.map((d) => (admin ? adminShape(d) : publicShape(d))),
    });
  }

  return NextResponse.json(
    { error: "slug ve (date | from+to) parametreleri gerekli" },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "Yetkisiz — admin token gerekli (x-admin-token header)" },
      { status: 401 }
    );
  }
  await loadFromFile();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { slug, date, ...patch } = parsed.data;
  const updated = setAvailability(slug, date, patch);
  return NextResponse.json({ ok: true, day: adminShape(updated) });
}
