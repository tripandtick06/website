// Sadakat puan programi — Faz 2.
//
// Importers:
//   - src/app/hesabim/page.tsx (Puanlarim tab)
//   - src/app/admin/page.tsx (Sadakat tab)
//   - src/app/api/loyalty/route.ts (GET/POST endpoint)
//   - src/components/sections/LoyaltySection.tsx (homepage)
//   - src/lib/referral.ts (referans bonusu apply)
// Glob check: src/data/loyalty.ts daha once yoktu.
// Data: deterministik xorshift32 PRNG ile 10 customer (CUST-0001..CUST-0009)
//        her birine 5-15 transaction. createdAt ISO 8601 string.
// User verbatim: "earnRate: 1 (€1 = 1 puan), redemptionRate: 100 (100 puan = €1),
//        firstBookingBonus: 200, reviewBonus: 50, referralBonus: 150, appDownloadBonus: 100"

import { MOCK_CUSTOMERS } from "@/data/mock-customers";

export const LOYALTY_CONFIG = {
  earnRate: 1, // €1 harcama = 1 puan
  redemptionRate: 100, // 100 puan = €1 indirim
  firstBookingBonus: 200,
  reviewBonus: 50,
  referralBonus: 150,
  appDownloadBonus: 100,
  expiryMonths: 24,
  tiers: [
    { name: "Standard", min: 0, discount: 0, color: "slate" },
    { name: "Silver", min: 600, discount: 3, color: "slate" },
    { name: "Gold", min: 1500, discount: 5, color: "amber" },
    { name: "Platinum", min: 5000, discount: 8, color: "violet" },
  ],
} as const;

export type LoyaltyTransactionType =
  | "earn"
  | "redeem"
  | "referral"
  | "bonus"
  | "expire";

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number; // pozitif=kazanim, negatif=harcama/expire
  type: LoyaltyTransactionType;
  bookingId?: string;
  description: string;
  createdAt: string; // ISO 8601
}

export interface LoyaltyTier {
  name: string;
  min: number;
  discount: number; // %
  color: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function getTier(totalPoints: number): LoyaltyTier {
  let current: LoyaltyTier = LOYALTY_CONFIG.tiers[0];
  for (const t of LOYALTY_CONFIG.tiers) {
    if (totalPoints >= t.min) current = t;
  }
  return current;
}

export function getNextTier(totalPoints: number): LoyaltyTier | null {
  for (const t of LOYALTY_CONFIG.tiers) {
    if (t.min > totalPoints) return t;
  }
  return null;
}

export function pointsToDiscount(points: number): number {
  return Math.floor(points / LOYALTY_CONFIG.redemptionRate);
}

export function earnPointsFromAmount(amountEur: number): number {
  return Math.floor(amountEur * LOYALTY_CONFIG.earnRate);
}

// ─────────────────────────────────────────────────────────────
// Mock data — 10 customer x 5-15 transaction (deterministik)
// ─────────────────────────────────────────────────────────────

function rand(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1000000) / 1000000;
  };
}

function buildMockTransactions(): LoyaltyTransaction[] {
  const list: LoyaltyTransaction[] = [];
  const baseDate = new Date("2026-05-15T00:00:00.000Z").getTime();
  const DAY = 86400000;
  const candidates = MOCK_CUSTOMERS.slice(0, 10);

  candidates.forEach((cust, ci) => {
    const rng = rand(ci * 173 + 11);
    const txCount = 5 + Math.floor(rng() * 11); // 5-15
    const descriptions: Record<LoyaltyTransactionType, string[]> = {
      earn: [
        "Balon turu rezervasyonu",
        "ATV turu rezervasyonu",
        "Otel konaklama",
        "Transfer hizmeti",
        "Yesil tur paketi",
      ],
      bonus: [
        "Ilk rezervasyon bonusu",
        "Yorum bonusu",
        "Mobil uygulama indirme bonusu",
        "Dogum gunu bonusu",
      ],
      redeem: ["Indirim kullanildi", "Puan ile odeme"],
      referral: ["Arkadas davet bonusu", "Davet kabul bonusu"],
      expire: ["Suresi dolan puanlar"],
    };

    for (let t = 0; t < txCount; t++) {
      const tr = rng();
      let type: LoyaltyTransactionType;
      if (tr < 0.55) type = "earn";
      else if (tr < 0.7) type = "bonus";
      else if (tr < 0.85) type = "redeem";
      else if (tr < 0.95) type = "referral";
      else type = "expire";

      let points: number;
      switch (type) {
        case "earn": points = 50 + Math.floor(rng() * 450); break;
        case "bonus": points = LOYALTY_CONFIG.firstBookingBonus; break;
        case "redeem": points = -(100 + Math.floor(rng() * 400)); break;
        case "referral": points = LOYALTY_CONFIG.referralBonus; break;
        case "expire": points = -(50 + Math.floor(rng() * 150)); break;
      }

      const descs = descriptions[type];
      const desc = descs[Math.floor(rng() * descs.length)];

      list.push({
        id: `LTX-${String(list.length + 1).padStart(5, "0")}`,
        customerId: cust.id,
        points,
        type,
        bookingId: type === "earn" ? `BK-${String(1000 + Math.floor(rng() * 200)).padStart(4, "0")}` : undefined,
        description: desc,
        createdAt: new Date(baseDate - Math.floor(rng() * 300) * DAY).toISOString(),
      });
    }
  });

  // sort desc by date
  list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return list;
}

export const MOCK_LOYALTY_TX: LoyaltyTransaction[] = buildMockTransactions();

// ─────────────────────────────────────────────────────────────
// Aggregations
// ─────────────────────────────────────────────────────────────

export function getCustomerBalance(customerId: string): number {
  return MOCK_LOYALTY_TX
    .filter((t) => t.customerId === customerId)
    .reduce((sum, t) => sum + t.points, 0);
}

export function getCustomerTransactions(customerId: string, limit?: number): LoyaltyTransaction[] {
  const list = MOCK_LOYALTY_TX.filter((t) => t.customerId === customerId);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getCustomerLoyaltyByEmail(email: string): {
  customerId: string | null;
  balance: number;
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  transactions: LoyaltyTransaction[];
} {
  const e = email.toLowerCase().trim();
  const cust = MOCK_CUSTOMERS.find((c) => c.email.toLowerCase() === e);
  if (!cust) {
    return {
      customerId: null,
      balance: 0,
      tier: LOYALTY_CONFIG.tiers[0],
      nextTier: LOYALTY_CONFIG.tiers[1] ?? null,
      transactions: [],
    };
  }
  const balance = getCustomerBalance(cust.id);
  return {
    customerId: cust.id,
    balance,
    tier: getTier(balance),
    nextTier: getNextTier(balance),
    transactions: getCustomerTransactions(cust.id, 25),
  };
}

export function getLoyaltyStats(): {
  customers: number;
  totalEarned: number;
  totalRedeemed: number;
  totalReferralBonus: number;
  averageBalance: number;
} {
  const earned = MOCK_LOYALTY_TX
    .filter((t) => t.points > 0 && t.type !== "expire")
    .reduce((s, t) => s + t.points, 0);
  const redeemed = MOCK_LOYALTY_TX
    .filter((t) => t.type === "redeem")
    .reduce((s, t) => s + Math.abs(t.points), 0);
  const referral = MOCK_LOYALTY_TX
    .filter((t) => t.type === "referral")
    .reduce((s, t) => s + t.points, 0);
  const customerIds = new Set(MOCK_LOYALTY_TX.map((t) => t.customerId));
  let totalBalance = 0;
  customerIds.forEach((id) => {
    totalBalance += getCustomerBalance(id);
  });
  return {
    customers: customerIds.size,
    totalEarned: earned,
    totalRedeemed: redeemed,
    totalReferralBonus: referral,
    averageBalance: customerIds.size > 0 ? Math.round(totalBalance / customerIds.size) : 0,
  };
}
