// Referans kodu sistemi — Faz 2.
//
// Importers:
//   - src/app/api/loyalty/route.ts (apply_referral action)
//   - src/app/davet/[code]/page.tsx (landing)
//   - src/app/hesabim/page.tsx (Referans tab — kod goster + paylas)
// Glob check: src/lib/referral.ts daha once yoktu.
// Data: in-memory MOCK_REFERRAL_LEDGER (Faz 2 prod Supabase).
//        Kod deterministik: email + SECRET salt -> base32 hash -> TT-XXXXXX.
// User verbatim: "deterministik (hash bazli) TT-{6char} kod; her iki tarafa bonus"

import { MOCK_CUSTOMERS } from "@/data/mock-customers";
import { LOYALTY_CONFIG } from "@/data/loyalty";

const REFERRAL_SALT = "tripandtick-referral-v1";
const BASE32 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0/1/I/O skip

// ─────────────────────────────────────────────────────────────
// Hash — non-cryptographic; deterministik kod uretimi icin.
// ─────────────────────────────────────────────────────────────
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash >>> 0;
}

function toBase32(num: number, length: number): string {
  let n = num >>> 0;
  let out = "";
  for (let i = 0; i < length; i++) {
    out = BASE32[n % BASE32.length] + out;
    n = Math.floor(n / BASE32.length);
  }
  return out;
}

export function generateReferralCode(email: string): string {
  const normalized = email.toLowerCase().trim();
  const h1 = fnv1a(`${REFERRAL_SALT}|${normalized}`);
  const h2 = fnv1a(`${normalized}|${REFERRAL_SALT}|salt2`);
  // 6 char base32 (~1 milyar kombinasyon)
  const combo = (h1 ^ (h2 << 1)) >>> 0;
  return `TT-${toBase32(combo, 6)}`;
}

// ─────────────────────────────────────────────────────────────
// Mock ledger — referans iliskileri
// ─────────────────────────────────────────────────────────────
export interface ReferralRecord {
  code: string;
  referrerCustomerId: string;
  referrerEmail: string;
  inviteeCustomerId?: string;
  inviteeEmail?: string;
  status: "pending" | "confirmed" | "rewarded";
  createdAt: string;
  confirmedAt?: string;
  bonusGranted: number;
}

function buildMockReferrals(): ReferralRecord[] {
  const baseDate = new Date("2026-05-15T00:00:00.000Z").getTime();
  const DAY = 86400000;
  const list: ReferralRecord[] = [];

  // Ilk 5 customer'a referans gecmisi
  MOCK_CUSTOMERS.slice(0, 5).forEach((cust, ci) => {
    const code = generateReferralCode(cust.email);
    const inviteCount = 1 + (ci % 4); // 1-4 davet
    for (let i = 0; i < inviteCount; i++) {
      const invitee = MOCK_CUSTOMERS[(ci + i + 7) % MOCK_CUSTOMERS.length];
      const isConfirmed = (ci + i) % 3 !== 0;
      list.push({
        code,
        referrerCustomerId: cust.id,
        referrerEmail: cust.email,
        inviteeCustomerId: isConfirmed ? invitee.id : undefined,
        inviteeEmail: invitee.email,
        status: isConfirmed ? "rewarded" : "pending",
        createdAt: new Date(baseDate - (30 + ci * 10 + i * 5) * DAY).toISOString(),
        confirmedAt: isConfirmed
          ? new Date(baseDate - (10 + ci * 5 + i * 2) * DAY).toISOString()
          : undefined,
        bonusGranted: isConfirmed ? LOYALTY_CONFIG.referralBonus : 0,
      });
    }
  });

  return list;
}

export const MOCK_REFERRAL_LEDGER: ReferralRecord[] = buildMockReferrals();

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export interface ApplyReferralResult {
  ok: boolean;
  message: string;
  referrerBonus?: number;
  inviteeBonus?: number;
  referrerEmail?: string;
}

/**
 * Referans kodu yeni musteri kaydinda uygulanir.
 * Her iki tarafa referralBonus puan (mock — Supabase'de transactional yapilacak).
 */
export function applyReferralCode(code: string, newCustomerId: string): ApplyReferralResult {
  const normalized = code.toUpperCase().trim();
  if (!/^TT-[A-Z0-9]{4,8}$/.test(normalized)) {
    return { ok: false, message: "Gecersiz referans kodu formati" };
  }
  // Mevcut customer'lar arasinda bu kodu ureten kim?
  const referrer = MOCK_CUSTOMERS.find(
    (c) => generateReferralCode(c.email) === normalized
  );
  if (!referrer) {
    return { ok: false, message: "Referans kodu bulunamadi" };
  }
  if (referrer.id === newCustomerId) {
    return { ok: false, message: "Kendi referans kodunuzu kullanamazsiniz" };
  }
  // Mock: ledger'a yeni kayit
  MOCK_REFERRAL_LEDGER.push({
    code: normalized,
    referrerCustomerId: referrer.id,
    referrerEmail: referrer.email,
    inviteeCustomerId: newCustomerId,
    status: "rewarded",
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
    bonusGranted: LOYALTY_CONFIG.referralBonus,
  });
  return {
    ok: true,
    message: `Referans kodu uygulandi — her iki tarafa ${LOYALTY_CONFIG.referralBonus} puan eklendi.`,
    referrerBonus: LOYALTY_CONFIG.referralBonus,
    inviteeBonus: LOYALTY_CONFIG.referralBonus,
    referrerEmail: referrer.email,
  };
}

export interface ReferralStats {
  code: string;
  invited: number;
  confirmed: number;
  pending: number;
  totalBonus: number;
  records: ReferralRecord[];
}

export function getReferralStats(customerId: string): ReferralStats {
  const cust = MOCK_CUSTOMERS.find((c) => c.id === customerId);
  const code = cust ? generateReferralCode(cust.email) : "TT-XXXXXX";
  const records = MOCK_REFERRAL_LEDGER.filter(
    (r) => r.referrerCustomerId === customerId
  );
  return {
    code,
    invited: records.length,
    confirmed: records.filter((r) => r.status === "rewarded").length,
    pending: records.filter((r) => r.status === "pending").length,
    totalBonus: records.reduce((s, r) => s + r.bonusGranted, 0),
    records,
  };
}

export function getReferralStatsByEmail(email: string): ReferralStats {
  const cust = MOCK_CUSTOMERS.find(
    (c) => c.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (!cust) {
    return {
      code: generateReferralCode(email),
      invited: 0,
      confirmed: 0,
      pending: 0,
      totalBonus: 0,
      records: [],
    };
  }
  return getReferralStats(cust.id);
}

export function findReferrerByCode(code: string): { id: string; email: string; name: string } | null {
  const normalized = code.toUpperCase().trim();
  const cust = MOCK_CUSTOMERS.find(
    (c) => generateReferralCode(c.email) === normalized
  );
  if (!cust) return null;
  return { id: cust.id, email: cust.email, name: cust.fullName };
}
