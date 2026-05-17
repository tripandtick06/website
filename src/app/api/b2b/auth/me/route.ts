// /api/b2b/auth/me — B2B acente session rehydrate.
//
// GET → cookie tripandtick_b2b verify → Agency public-fields JSON.
// Auth yoksa veya cookie gecersiz → 401.

import { NextResponse, type NextRequest } from "next/server";
import { getAgencyById } from "@/data/agencies";
import { B2B_COOKIE_NAME, verifyB2BSession } from "@/lib/b2b-session";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(B2B_COOKIE_NAME)?.value;
  const agencyId = await verifyB2BSession(cookie);
  if (!agencyId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const agency = getAgencyById(agencyId);
  if (!agency || !agency.active) {
    return NextResponse.json({ error: "Hesap bulunamadi" }, { status: 404 });
  }
  // Public fields — acente kendi apiKey'ini dashboard'da gorebilir.
  return NextResponse.json({
    ok: true,
    agency: {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      contactPerson: agency.contactPerson,
      phone: agency.phone,
      country: agency.country,
      commissionRate: agency.commissionRate,
      creditLimit: agency.creditLimit,
      creditUsed: agency.creditUsed,
      apiKey: agency.apiKey,
      createdAt: agency.createdAt,
    },
  });
}
