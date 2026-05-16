// POST/GET /api/iyzico/callback — DEMO/STUB mode (Cloudflare Pages edge runtime).
//
// iyzipay SDK Node-only oldugu icin edge-safe degil. /checkout demo-mode'da
// iyzico'ya hicbir cagri yapmiyor; bu callback gercek iyzico-flow icin sadece
// Faz 2 REST + WebCrypto rewrite sonrasi aktif olacak. Su an: gelirse
// otomatik basarili redirect (demo).
//
// Callers: iyzico hosted page external submit (Faz 2 sonra).

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

async function handle(req: NextRequest, body: Record<string, string>): Promise<NextResponse> {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId") ?? body.bookingId ?? "";
  const token = body.token ?? url.searchParams.get("token") ?? "";

  if (!token || !bookingId) {
    return NextResponse.redirect(`${SITE_URL}/rezervasyon/iptal?reason=missing-token`);
  }
  // Demo: dogrudan basarili sayfaya yonlendir (Faz 2: gercek iyzico verify).
  const target = new URL(`${SITE_URL}/rezervasyon/basarili`);
  target.searchParams.set("provider", "iyzico");
  target.searchParams.set("token", token);
  target.searchParams.set("bookingId", bookingId);
  target.searchParams.set("demo", "1");
  return NextResponse.redirect(target.toString());
}

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      form.forEach((v, k) => {
        body[k] = String(v);
      });
    } else if (ct.includes("application/json")) {
      body = await req.json();
    }
  } catch {
    body = {};
  }
  return handle(req, body);
}

export async function GET(req: NextRequest) {
  return handle(req, {});
}
