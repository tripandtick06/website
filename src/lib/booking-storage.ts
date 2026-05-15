// Client-side booking draft state (localStorage). SSR-safe.
// Faz 2'de server-side cart Supabase'e gecer.

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface BookingPassenger {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  age?: number;
  accommodation?: string;
}

export interface BookingDraft {
  serviceSlug: string;
  serviceName: string;
  date: string;
  adults: number;
  children: number;
  unitPrice: number;
  childRatio: number;
  currency: string;
  passengers: BookingPassenger[];
  insurance: boolean;
  promoCode?: string;
  totalPrice: number;
  step: BookingStep;
}

const STORAGE_KEY = "tripandtick:booking:draft";
const INSURANCE_PER_PAX = 9;
const PROMO_CODES: Record<string, number> = {
  WELCOME10: 0.1,
  EMERCE5: 0.05,
};

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadDraft(): BookingDraft | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingDraft;
    if (!parsed || typeof parsed !== "object" || !parsed.serviceSlug) return null;
    return parsed;
  } catch (err) {
    console.error("[booking-storage] loadDraft failed", err);
    return null;
  }
}

export function saveDraft(draft: BookingDraft): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error("[booking-storage] saveDraft failed", err);
  }
}

export function clearDraft(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("[booking-storage] clearDraft failed", err);
  }
}

export function computeTotal(d: Pick<BookingDraft, "adults" | "children" | "unitPrice" | "childRatio" | "insurance" | "promoCode">): number {
  const adultsTotal = d.adults * d.unitPrice;
  const childrenTotal = d.children * d.unitPrice * d.childRatio;
  const paxCount = d.adults + d.children;
  const insuranceTotal = d.insurance ? paxCount * INSURANCE_PER_PAX : 0;
  let subtotal = adultsTotal + childrenTotal + insuranceTotal;

  if (d.promoCode) {
    const code = d.promoCode.toUpperCase().trim();
    const discount = PROMO_CODES[code];
    if (discount) {
      subtotal = subtotal * (1 - discount);
    }
  }

  return Math.round(subtotal);
}

export function getPromoDiscount(code: string | undefined): number {
  if (!code) return 0;
  return PROMO_CODES[code.toUpperCase().trim()] ?? 0;
}

export function isValidPromoCode(code: string | undefined): boolean {
  if (!code) return false;
  return !!PROMO_CODES[code.toUpperCase().trim()];
}

export function generateBookingCode(): string {
  // 8-char alfanumerik (excl O/0/I/1 confusables)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const INSURANCE_PRICE_PER_PAX = INSURANCE_PER_PAX;
