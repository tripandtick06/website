// GET /api/davet?code= — Referans kodu lookup (davet landing icin).
//
// Callers:
//   - src/app/davet/[code]/page.tsx (referrer ismi/varligi dogrula)
// Glob check: src/app/api/davet/ daha once yoktu.

import { NextResponse, type NextRequest } from "next/server";
import { findReferrerByCode } from "@/lib/referral";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.toUpperCase().trim() ?? "";
  if (!code) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }
  const referrer = findReferrerByCode(code);
  if (!referrer) {
    return NextResponse.json({ exists: false, code });
  }
  // PII koruma: sadece ad'in ilk adi + soyad'in bas harfi
  const parts = referrer.name.trim().split(/\s+/);
  const safeName =
    parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1][0]}.`
      : parts[0];
  return NextResponse.json({ exists: true, code, name: safeName });
}
