// Shared server-side pricing — Stripe + iyzico checkout anti-tampering.
//
// Importers (callers):
//   - src/app/api/checkout/route.ts (Stripe)
//   - src/app/api/iyzico/checkout/route.ts (iyzico)
// Catalog + service_overrides lookup → authoritative serverTotal.
// Override cancelled/sold_out → ok:false + status 409.
// Catalog priceOnRequest → ok:false + status 400.
// Catalog yok → ok:false + status 404.

import { getOverride, type ServiceOverride } from "@/lib/db/service-overrides";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";

export const INSURANCE_PRICE_PER_PAX = 15;
export const DEFAULT_CHILD_RATIO = 0.8;

export interface CatalogEntry {
  slug: string;
  name: string;
  adultPrice: number;
  childRatio: number;
  currency: string;
  priceOnRequest?: boolean;
}

export interface PricingInput {
  serviceSlug: string;
  date: string; // YYYY-MM-DD
  adults: number;
  children: number;
  insurance?: boolean;
  promoCode?: string;
}

export interface PricingBreakdown {
  adultsLine: number;
  childrenLine: number;
  insuranceLine: number;
  preDiscount: number;
  discount: number;
}

export type PricingResult =
  | {
      ok: true;
      serverTotal: number;
      currency: string;
      catalog: CatalogEntry;
      override: ServiceOverride | null;
      breakdown: PricingBreakdown;
    }
  | {
      ok: false;
      status: 400 | 404 | 409;
      error: string;
      reason?: string | null;
    };

export function findCatalog(slug: string): CatalogEntry | null {
  const b = BALLOON_PACKAGES.find((p) => p.slug === slug);
  if (b) {
    return {
      slug: b.slug,
      name: b.name,
      adultPrice: b.adultPrice,
      childRatio: b.childRatio,
      currency: b.currency,
      priceOnRequest: b.priceOnRequest,
    };
  }
  const all = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];
  const it = all.find((s) => s.slug === slug);
  if (it) {
    return {
      slug: it.slug,
      name: it.name,
      adultPrice: it.adultPrice,
      childRatio: DEFAULT_CHILD_RATIO,
      currency: it.currency,
      priceOnRequest: it.priceOnRequest,
    };
  }
  return null;
}

export function promoDiscount(code: string | undefined, preDiscount: number): number {
  if (!code) return 0;
  const c = code.toUpperCase().trim();
  if (c === "WELCOME10") return Math.round(preDiscount * 0.1);
  if (c === "EMERCE5") return Math.round(preDiscount * 0.05);
  if (c === "AILE15") return Math.round(preDiscount * 0.15);
  if (c === "MACERA20") return Math.round(preDiscount * 0.2);
  return 0;
}

export async function computeServerTotal(input: PricingInput): Promise<PricingResult> {
  const catalog = findCatalog(input.serviceSlug);
  if (!catalog) {
    return { ok: false, status: 404, error: "Hizmet bulunamadi" };
  }
  if (catalog.priceOnRequest) {
    return {
      ok: false,
      status: 400,
      error: "Bu hizmet icin direkt online odeme yok — telefon/WhatsApp ile iletisime gecin.",
    };
  }
  const override = await getOverride(input.serviceSlug, input.date).catch(() => null);
  if (override?.status === "cancelled" || override?.status === "sold_out") {
    return {
      ok: false,
      status: 409,
      error:
        override.status === "cancelled"
          ? "Bu tarih iptal — lutfen baska tarih secin."
          : "Bu tarih dolu — lutfen baska tarih secin.",
      reason: override.cancellationReason,
    };
  }

  const effectiveAdultPrice = override?.priceOverride ?? catalog.adultPrice;
  const pax = input.adults + input.children;
  const adultsLine = input.adults * effectiveAdultPrice;
  const childrenLine = Math.round(input.children * effectiveAdultPrice * catalog.childRatio);
  const insuranceLine = input.insurance ? pax * INSURANCE_PRICE_PER_PAX : 0;
  const preDiscount = adultsLine + childrenLine + insuranceLine;
  const discount = promoDiscount(input.promoCode, preDiscount);
  const serverTotal = Math.max(1, preDiscount - discount);

  return {
    ok: true,
    serverTotal,
    currency: override?.currency ?? catalog.currency,
    catalog,
    override,
    breakdown: { adultsLine, childrenLine, insuranceLine, preDiscount, discount },
  };
}
