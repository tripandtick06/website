// /api/unsubscribe — RFC 8058 one-click unsubscribe receiver + landing.
//
// POST: List-Unsubscribe-Post header tetikler (mail client one-click).
//   Body: form-encoded "List-Unsubscribe=One-Click" + query ?token=...
//   Effect: log opt-out + (TODO: bookings marketing_opt_out flag).
// GET: ?token=... ile mailto/manual click — basit HTML landing.
//
// Auth: HMAC token (lib/unsubscribe-token.ts). Email forgery koruma.
// Edge runtime.

import { NextResponse, type NextRequest } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function handleOptOut(token: string | null): Promise<{
  ok: boolean;
  status: number;
  email?: string;
  list?: string;
  error?: string;
}> {
  if (!token) return { ok: false, status: 400, error: "Token eksik" };
  const result = await verifyUnsubscribeToken(token);
  if (!result.valid || !result.payload) {
    return { ok: false, status: 400, error: "Gecersiz veya bozuk link" };
  }
  // TODO: Supabase bookings.marketing_opt_out = true WHERE email = ?
  // Migration 0004 + bookings.ts'e setMarketingOptOut() eklenince burada cagrilacak.
  console.info("[api/unsubscribe] opt-out kayit", {
    email: result.payload.email,
    list: result.payload.list,
  });
  return {
    ok: true,
    status: 200,
    email: result.payload.email,
    list: result.payload.list,
  };
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const result = await handleOptOut(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, email: result.email, list: result.list });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const result = await handleOptOut(token);

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  if (!result.ok) {
    const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Abonelik iptali — Trip and Tick</title><meta name="robots" content="noindex,nofollow"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#1e293b"><h1 style="color:#dc2626">Hata</h1><p>${escape(result.error ?? "Bilinmeyen hata")}</p><p><a href="https://tripandtick.com">Ana sayfaya don</a></p></body></html>`;
    return new NextResponse(html, {
      status: result.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Abonelikten cikildi — Trip and Tick</title><meta name="robots" content="noindex,nofollow"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#1e293b"><h1 style="color:#16a34a">Tamam!</h1><p><strong>${escape(result.email ?? "")}</strong> adresi <strong>${escape(result.list ?? "marketing")}</strong> e-postalarindan cikarildi.</p><p>Rezervasyon onaylari ve degisiklik bildirimleri (transactional) gonderilmeye devam edecek.</p><p style="margin-top:32px"><a href="https://tripandtick.com" style="display:inline-block;background:#dc2626;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Ana sayfaya don</a></p></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
