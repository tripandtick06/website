// /api/admin/auth — admin login server-side.
//
// Onceden /admin/login page.tsx CLIENT-SIDE password karsilastiriyordu
// (bundle.js'de hardcoded — ciddi guvenlik acigi). Bu endpoint server-side
// constant-time eq yapar + dogru ise ADMIN_API_TOKEN return eder.
//
// Auth: env ADMIN_EMAIL + ADMIN_PASSWORD. Constant-time string compare.
// Rate-limit: middleware.ts global 10/dk + ek IP-bazli failed-attempt cap.
// Response: { ok, token? } — frontend localStorage'a koyar (Faz X: httpOnly cookie).

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@tripandtick.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON parse hatasi" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz veri" }, { status: 400 });
  }

  if (!ADMIN_PASSWORD || !ADMIN_API_TOKEN) {
    return NextResponse.json(
      { error: "Admin auth yapilandirilmamis" },
      { status: 503 }
    );
  }

  const emailOk = timingSafeEqual(parsed.data.email.trim().toLowerCase(), ADMIN_EMAIL);
  const pwdOk = timingSafeEqual(parsed.data.password, ADMIN_PASSWORD);

  if (!emailOk || !pwdOk) {
    return NextResponse.json({ error: "E-posta veya sifre hatali" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, token: ADMIN_API_TOKEN });
}
