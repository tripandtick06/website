// /api/b2b/auth/login — B2B acente server-side login.
//
// POST {email, apiKey} → agencies.ts validate → Set-Cookie tripandtick_b2b httpOnly.
// Body validation: zod. Constant-time apiKey compare.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAgencyByEmail } from "@/data/agencies";
import {
  B2B_COOKIE_NAME,
  B2B_COOKIE_MAX_AGE,
  signB2BSession,
  isFixtureKeyInProd,
} from "@/lib/b2b-session";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  apiKey: z.string().min(8).max(200),
});

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
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
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz veri" }, { status: 400 });
  }
  // Defense-in-depth: prod'da fixture-key prefix hard-reject (DB-lookup'a bile gitme).
  if (isFixtureKeyInProd(parsed.data.apiKey)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const agency = getAgencyByEmail(parsed.data.email);
  if (!agency) {
    return NextResponse.json({ error: "E-posta bulunamadi veya hesap pasif" }, { status: 401 });
  }
  if (!agency.active) {
    return NextResponse.json({ error: "Hesabiniz pasif — destek ile iletisime gecin" }, { status: 403 });
  }
  if (!timingSafeEqualStr(agency.apiKey, parsed.data.apiKey.trim())) {
    return NextResponse.json({ error: "API key hatali" }, { status: 401 });
  }

  const token = await signB2BSession(agency.id);
  const res = NextResponse.json({ ok: true, agencyId: agency.id });
  res.cookies.set(B2B_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: B2B_COOKIE_MAX_AGE,
  });
  return res;
}
