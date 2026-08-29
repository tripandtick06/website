// B2B acente fiyat-listesi API endpoint — x-api-key auth.
//
// Importers (client fetch): acente sistem entegrasyonu, dashboard preview.
//   Auto-route /api/b2b/services. Referenced /b2b/dashboard ApiTab endpoint list.
// Affected: acente fiyat senkron + cron pull.
// Data: GET → {data: {services: {slug, name, listPrice, netPrice, currency,
//        savings, rating, includes, highlights, badge}[], agencyId,
//        commissionRate, count}, error: null}.
// Auth: x-api-key header → getAgencyByApiKey().
// User verbatim: "GET tum hizmetler + acente-ozel fiyatlar. Auth: x-api-key."

import { NextResponse, type NextRequest } from "next/server";
import { getAgencyByApiKey, agencyNetPrice, type Agency } from "@/data/agencies";
import { isFixtureKeyInProd } from "@/lib/b2b-session";
import { listBaseOverrides } from "@/lib/db/service-overrides";
import {
  ACTIVITIES,
  TOURS,
  HOTELS,
  PACKAGES,
  TRANSFERS,
} from "@/data/services/catalog";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ALL_SERVICES = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];

function authAgency(req: NextRequest): Agency | null {
  const key = req.headers.get("x-api-key");
  if (!key) return null;
  // Defense-in-depth: prod'da fixture-key prefix hard-reject.
  if (isFixtureKeyInProd(key)) return null;
  return getAgencyByApiKey(key) ?? null;
}

export async function GET(req: NextRequest) {
  const agency = authAgency(req);
  if (!agency) {
    return NextResponse.json(
      { data: null, error: "Yetkisiz — x-api-key gerekli veya gecersiz" },
      { status: 401 }
    );
  }

  // Base-fiyat override'lari tek seferde cek — slug -> price_override map.
  const baseOverrides = await listBaseOverrides().catch((err) => {
    console.error("[api/b2b/services] listBaseOverrides failed", err);
    return [];
  });
  const basePriceBySlug = new Map<string, number>();
  for (const o of baseOverrides) {
    if (o.priceOverride !== null) basePriceBySlug.set(o.serviceSlug, o.priceOverride);
  }

  const services = ALL_SERVICES.map((s) => {
    const listPrice = basePriceBySlug.get(s.slug) ?? s.adultPrice;
    const netPrice = agencyNetPrice(listPrice, agency.commissionRate);
    return {
      slug: s.slug,
      category: s.category,
      name: s.name,
      shortDescription: s.shortDescription,
      duration: s.duration,
      listPrice,
      netPrice,
      savings: Math.round((listPrice - netPrice) * 100) / 100,
      currency: s.currency,
      rating: s.rating,
      reviewCount: s.reviewCount,
      includes: s.includes,
      highlights: s.highlights,
      badge: s.badge ?? null,
    };
  });

  return NextResponse.json({
    data: {
      agencyId: agency.id,
      commissionRate: agency.commissionRate,
      count: services.length,
      services,
    },
    error: null,
  });
}
