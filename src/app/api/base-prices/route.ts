// GET /api/base-prices — public, tum servislerin base-fiyat override'lari.
//
// Importers (planned callers):
//   - src/app/[locale]/** fiyat listeleme sayfalari (katalog fallback oncesi override).
// Affected: BASE_PRICE_DATE (1970-01-01) satirlarindan slug -> price map.
// Data: Output: { prices: { [slug]: number } } — sadece price_override != null
//        VE status != 'cancelled' olan satirlar dahil edilir.

import { NextResponse } from "next/server";
import { listBaseOverrides } from "@/lib/db/service-overrides";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseOverrides = await listBaseOverrides().catch((err) => {
    console.error("[api/base-prices] listBaseOverrides failed", err);
    return [];
  });

  const prices: Record<string, number> = {};
  for (const o of baseOverrides) {
    if (o.priceOverride !== null && o.status !== "cancelled") {
      prices[o.serviceSlug] = o.priceOverride;
    }
  }

  return NextResponse.json(
    { prices },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
