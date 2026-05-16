// Kupon kodu kataloğu — admin paneli yönetimi (Faz 1 in-memory, Faz 2 Supabase).
//
// Importers:
//   - src/app/api/coupon/validate/route.ts (POST validate)
//   - src/app/api/admin/coupons/route.ts (GET / POST / DELETE)
//   - src/app/admin/page.tsx (Kuponlar tab UI)
// Affected: rezervasyon kupon indirimi + admin yönetimi.
// Data: ISO 8601 tarihler ("2026-12-31T23:59:59.000Z"). In-memory Map
// (Cloudflare Pages Functions cold-start'inda SEED'den yeniden doldurulur).
// User verbatim: "Coupon { code, type: 'percent'|'fixed', value, validFrom, validUntil,
// usageLimit, usedCount, minPurchase?, applicableSlugs?, active }
// MOCK_COUPONS: 5+ entry (WELCOME10 %10, EMERCE5 %5, AILE15 %15 sadece aile-paketi,
// MACERA20 %20, SUMMER25 %25)."

export type CouponType = "percent" | "fixed";

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  minPurchase?: number;
  applicableSlugs?: string[];
  active: boolean;
  description?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  discount: number;
  newTotal: number;
}

const COUPON_STORE = new Map<string, Coupon>();

const SEED: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: "2026-12-31T23:59:59.000Z",
    usageLimit: 1000,
    usedCount: 127,
    active: true,
    description: "Yeni misafir hoşgeldin indirimi — %10",
  },
  {
    code: "EMERCE5",
    type: "percent",
    value: 5,
    validFrom: "2026-04-01T00:00:00.000Z",
    validUntil: "2026-09-30T23:59:59.000Z",
    usageLimit: 500,
    usedCount: 43,
    minPurchase: 100,
    active: true,
    description: "Emerce 100 kampanyası — €100+ rezervasyonlarda %5",
  },
  {
    code: "AILE15",
    type: "percent",
    value: 15,
    validFrom: "2026-03-01T00:00:00.000Z",
    validUntil: "2026-11-30T23:59:59.000Z",
    usageLimit: 200,
    usedCount: 18,
    applicableSlugs: ["aile-paketi"],
    active: true,
    description: "Aile Paketi'nde %15 indirim",
  },
  {
    code: "MACERA20",
    type: "percent",
    value: 20,
    validFrom: "2026-05-01T00:00:00.000Z",
    validUntil: "2026-08-31T23:59:59.000Z",
    usageLimit: 150,
    usedCount: 62,
    applicableSlugs: [
      "macera-paketi",
      "atv-standart",
      "atv-full",
      "jeep-yarim",
      "jeep-tam",
    ],
    active: true,
    description: "Macera ve ATV/Jeep aktivitelerinde %20",
  },
  {
    code: "SUMMER25",
    type: "percent",
    value: 25,
    validFrom: "2026-06-01T00:00:00.000Z",
    validUntil: "2026-08-31T23:59:59.000Z",
    usageLimit: 100,
    usedCount: 0,
    minPurchase: 200,
    active: true,
    description: "Yaz kampanyası — €200+ rezervasyonlarda %25",
  },
  {
    code: "FLASH50",
    type: "fixed",
    value: 50,
    validFrom: "2026-05-01T00:00:00.000Z",
    validUntil: "2026-05-31T23:59:59.000Z",
    usageLimit: 50,
    usedCount: 50,
    active: false,
    description: "Mayıs flash kampanyası — €50 sabit indirim (limit doldu)",
  },
];

function ensureSeeded(): void {
  if (COUPON_STORE.size === 0) {
    SEED.forEach((c) => COUPON_STORE.set(c.code.toUpperCase(), { ...c }));
  }
}

export const MOCK_COUPONS: Coupon[] = SEED;

export function getAllCoupons(): Coupon[] {
  ensureSeeded();
  return Array.from(COUPON_STORE.values()).sort((a, b) =>
    a.code.localeCompare(b.code)
  );
}

export function getCouponByCode(code: string): Coupon | undefined {
  ensureSeeded();
  if (!code) return undefined;
  return COUPON_STORE.get(code.toUpperCase().trim());
}

export function isCouponValid(
  coupon: Coupon,
  total: number,
  slug?: string
): { valid: boolean; reason?: string } {
  if (!coupon.active) return { valid: false, reason: "Bu kupon devre dışı." };
  const now = new Date();
  const from = new Date(coupon.validFrom);
  const until = new Date(coupon.validUntil);
  if (now < from) return { valid: false, reason: "Bu kupon henüz aktif değil." };
  if (now > until) return { valid: false, reason: "Bu kuponun süresi dolmuş." };
  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "Bu kuponun kullanım limiti dolmuş." };
  }
  if (coupon.minPurchase && total < coupon.minPurchase) {
    return {
      valid: false,
      reason: `Minimum sepet tutarı €${coupon.minPurchase} olmalı.`,
    };
  }
  if (coupon.applicableSlugs && coupon.applicableSlugs.length > 0 && slug) {
    if (!coupon.applicableSlugs.includes(slug)) {
      return { valid: false, reason: "Bu kupon seçilen hizmet için geçerli değil." };
    }
  }
  return { valid: true };
}

export function applyCoupon(total: number, coupon: Coupon): number {
  if (coupon.type === "percent") {
    return Math.max(0, Math.round(total * (1 - coupon.value / 100)));
  }
  return Math.max(0, Math.round(total - coupon.value));
}

export function validateAndApply(
  code: string,
  total: number,
  slug?: string
): CouponValidationResult {
  const c = getCouponByCode(code);
  if (!c) {
    return {
      valid: false,
      message: "Kupon kodu bulunamadı.",
      discount: 0,
      newTotal: total,
    };
  }
  const check = isCouponValid(c, total, slug);
  if (!check.valid) {
    return {
      valid: false,
      message: check.reason ?? "Kupon geçersiz.",
      discount: 0,
      newTotal: total,
    };
  }
  const newTotal = applyCoupon(total, c);
  const discount = total - newTotal;
  const valueLabel = c.type === "percent" ? `%${c.value}` : `€${c.value}`;
  return {
    valid: true,
    message: `${c.code} uygulandı (${valueLabel} indirim).`,
    discount,
    newTotal,
  };
}

export function upsertCoupon(input: Coupon): Coupon {
  ensureSeeded();
  const code = input.code.toUpperCase().trim();
  const next: Coupon = { ...input, code };
  COUPON_STORE.set(code, next);
  return next;
}

export function deleteCoupon(code: string): boolean {
  ensureSeeded();
  return COUPON_STORE.delete(code.toUpperCase().trim());
}

export function getCouponStatus(
  c: Coupon
): "active" | "expired" | "exhausted" | "inactive" {
  if (!c.active) return "inactive";
  const now = new Date();
  if (now > new Date(c.validUntil)) return "expired";
  if (c.usedCount >= c.usageLimit) return "exhausted";
  return "active";
}
