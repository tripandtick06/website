// GET /api/price?slug=X&date=YYYY-MM-DD — public dinamik fiyat + iptal/rotar status.
//
// Importers (callers):
//   - src/app/[locale]/rezervasyon/[slug]/BookingClient.tsx (Step 2 sonrasi)
// Affected: tarih secimi sonrasi gercek fiyat + hava iptal/rotar bilgisi.
// Data:
//   Input: slug (string), date (YYYY-MM-DD)
//   Output: { slug, date, catalogPrice, effectivePrice, currency, status,
//             cancellationReason?, delayMinutes?, note?, priceOnRequest?, dynamicPricing? }

import { NextResponse, type NextRequest } from "next/server";
import { getOverride } from "@/lib/db/service-overrides";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface CatalogEntry {
  slug: string;
  name: string;
  adultPrice: number;
  currency: string;
  priceOnRequest?: boolean;
  dynamicPricing?: boolean;
}

function findCatalogEntry(slug: string): CatalogEntry | null {
  const balloon = BALLOON_PACKAGES.find((p) => p.slug === slug);
  if (balloon) {
    return {
      slug: balloon.slug,
      name: balloon.name,
      adultPrice: balloon.adultPrice,
      currency: balloon.currency,
      priceOnRequest: balloon.priceOnRequest,
      dynamicPricing: balloon.dynamicPricing,
    };
  }
  const all = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];
  const item = all.find((s) => s.slug === slug);
  if (item) {
    return {
      slug: item.slug,
      name: item.name,
      adultPrice: item.adultPrice,
      currency: item.currency,
    };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const date = url.searchParams.get("date") ?? "";

  if (!slug || !date) {
    return NextResponse.json({ error: "slug ve date zorunlu" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date YYYY-MM-DD formatinda olmali" }, { status: 400 });
  }

  const catalog = findCatalogEntry(slug);
  if (!catalog) {
    return NextResponse.json({ error: "Hizmet bulunamadi" }, { status: 404 });
  }

  const override = await getOverride(slug, date).catch((err) => {
    console.error("[api/price] getOverride failed", err);
    return null;
  });

  const effectivePrice = override?.priceOverride ?? catalog.adultPrice;
  const status = override?.status ?? "active";

  return NextResponse.json(
    {
      slug: catalog.slug,
      name: catalog.name,
      date,
      catalogPrice: catalog.adultPrice,
      effectivePrice,
      currency: override?.currency ?? catalog.currency,
      status,
      cancellationReason: override?.cancellationReason ?? null,
      delayMinutes: override?.delayMinutes ?? null,
      note: override?.note ?? null,
      priceOnRequest: catalog.priceOnRequest ?? false,
      dynamicPricing: catalog.dynamicPricing ?? false,
      hasOverride: !!override,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
