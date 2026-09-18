import { NextResponse, type NextRequest } from "next/server";
import {
  batchSchema,
  cleanPath,
  deviceOf,
  insertEvents,
  isBotUA,
  visitorHash,
  type EventRow,
} from "@/lib/analytics/events";

// Davranış ölçümü beacon'ı. Caller: src/components/analytics/Tracker.tsx (sendBeacon /
// keepalive fetch, toplu). Doğrula → bot ele → ülke/cihaz/vhash ekle → Supabase `events`.
// Cevap her zaman 200/204 ve hızlı: müşteri akışını asla etkilemez, hata loglanır.
// Rate-limit: src/middleware.ts (/api/event per-IP, geniş pencere — batch'ler seyrek).

export const runtime = "edge";
export const dynamic = "force-dynamic";

const EMPTY = new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }
  if (parsed.data._hp && parsed.data._hp.trim().length > 0) return EMPTY;

  const ua = req.headers.get("user-agent") ?? "";
  if (isBotUA(ua)) return EMPTY;

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0";
  const salt = process.env.ANALYTICS_SALT ?? process.env.DEPLOY_SECRET ?? "tt";
  const vhash = await visitorHash(ip, ua, salt);
  const country = req.headers.get("cf-ipcountry") ?? null;
  const device = deviceOf(ua);

  const rows: EventRow[] = parsed.data.events.map((e) => ({
    sid: e.sid,
    seq: e.seq,
    vhash,
    name: e.name,
    path: cleanPath(e.path),
    locale: e.locale ?? null,
    ref_host: e.ref_host ?? null,
    country,
    device,
    product: e.product ?? null,
    props: e.props ?? {},
  }));

  const ok = await insertEvents(rows);
  if (!ok) console.info("[api/event] insert atlandı/başarısız", rows.length);
  return EMPTY;
}
