// Tek iptal politikasi kaynagi (musterinin odeme adiminda onayladigi kural):
//   >= 48 saat once: ucretsiz iptal (%100 iade)
//   24-48 saat:      %50 iade
//   < 24 saat:       iade yok
//   Operator/hava iptali: her zaman %100 (bu fonksiyon musteri iptalini kapsar).
// Metinler (dictionaries step4_*, iptal_iade_politikasi, FAQ) bu esiklerle
// tests/lib/cancellation-policy.test.ts tarafindan karsilastirilir.
export const FREE_CANCEL_HOURS = 48;
export const PARTIAL_REFUND_HOURS = 24;
export const PARTIAL_REFUND_PCT = 50;

export function refundTier(hoursUntil: number): { pct: number; days: number } {
  if (hoursUntil >= FREE_CANCEL_HOURS) return { pct: 100, days: 5 };
  if (hoursUntil >= PARTIAL_REFUND_HOURS) return { pct: PARTIAL_REFUND_PCT, days: 7 };
  return { pct: 0, days: 0 };
}
