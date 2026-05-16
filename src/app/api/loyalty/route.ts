// GET/POST /api/loyalty — Sadakat ve referans API.
//
// Callers:
//   - src/app/hesabim/page.tsx (Puanlarim tab fetch)
//   - src/app/davet/[code]/page.tsx (apply_referral)
// Glob check: src/app/api/loyalty/ daha once yoktu.
// User verbatim: "GET ?email= → musterinin puan + tier + transactions;
//   POST {action: 'redeem'|'apply_referral', ...} → puan kullan veya referans kod uygula"

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getCustomerLoyaltyByEmail,
  pointsToDiscount,
  LOYALTY_CONFIG,
} from "@/data/loyalty";
import {
  applyReferralCode,
  getReferralStatsByEmail,
  generateReferralCode,
} from "@/lib/referral";
import { MOCK_CUSTOMERS } from "@/data/mock-customers";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim() ?? "";
  if (!email) {
    return NextResponse.json({ error: "email query gerekli" }, { status: 400 });
  }
  const loyalty = getCustomerLoyaltyByEmail(email);
  const referral = getReferralStatsByEmail(email);

  return NextResponse.json({
    email,
    customerId: loyalty.customerId,
    balance: loyalty.balance,
    redeemableEuro: pointsToDiscount(loyalty.balance),
    tier: loyalty.tier,
    nextTier: loyalty.nextTier,
    transactions: loyalty.transactions,
    referral: {
      code: referral.code,
      invited: referral.invited,
      confirmed: referral.confirmed,
      pending: referral.pending,
      totalBonus: referral.totalBonus,
    },
    config: {
      earnRate: LOYALTY_CONFIG.earnRate,
      redemptionRate: LOYALTY_CONFIG.redemptionRate,
      referralBonus: LOYALTY_CONFIG.referralBonus,
    },
  });
}

const redeemSchema = z.object({
  action: z.literal("redeem"),
  email: z.string().email(),
  points: z.number().int().min(100),
  bookingId: z.string().optional(),
});

const applyReferralSchema = z.object({
  action: z.literal("apply_referral"),
  code: z.string().min(4),
  email: z.string().email(),
});

const postSchema = z.union([redeemSchema, applyReferralSchema]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz istek", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.action === "redeem") {
      const { email, points, bookingId } = parsed.data;
      const loyalty = getCustomerLoyaltyByEmail(email);
      if (loyalty.balance < points) {
        return NextResponse.json(
          { error: `Yetersiz puan (mevcut: ${loyalty.balance})` },
          { status: 400 }
        );
      }
      const discountEur = pointsToDiscount(points);
      // Mock: gercek transactional Supabase Faz 2.
      return NextResponse.json({
        ok: true,
        action: "redeem",
        spentPoints: points,
        discountEur,
        bookingId: bookingId ?? null,
        message: `${points} puan kullanildi — €${discountEur} indirim uygulandi.`,
      });
    }

    // apply_referral
    const { code, email } = parsed.data;
    const newCust = MOCK_CUSTOMERS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase().trim()
    );
    const newCustomerId = newCust?.id ?? `NEW-${Date.now()}`;

    // Kendi kodunu engelle
    if (newCust && generateReferralCode(newCust.email) === code.toUpperCase().trim()) {
      return NextResponse.json(
        { error: "Kendi referans kodunuzu kullanamazsiniz" },
        { status: 400 }
      );
    }

    const result = applyReferralCode(code, newCustomerId);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      action: "apply_referral",
      message: result.message,
      referrerBonus: result.referrerBonus,
      inviteeBonus: result.inviteeBonus,
    });
  } catch (err) {
    console.error("[api/loyalty] error", err);
    return NextResponse.json({ error: "Beklenmeyen hata" }, { status: 500 });
  }
}
