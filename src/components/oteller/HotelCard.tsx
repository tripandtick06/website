"use client";

// Booking.com-tarzi otel property-card. Rezervasyon YOK — CTA = "Fiyat teklifi al".
// Importers: src/components/oteller/HotelsGrid.tsx
// Data: item (ServiceItem, category="hotel"); rating(0-5), reviewCount, tier, region,
//       amenities?/includes, photoUrl?.
// i18n-debt: yeni otel CTA/etiket string'leri TR hardcode (ServiceCard "Rezervasyon"/
//   "Bilgi & Form" hardcode precedent'ine uyumlu). 9-locale dictionary churn'u sonra.

import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReviewScore } from "@/components/ui/ReviewScore";
import { AmenityChips } from "@/components/ui/AmenityChips";
import type { ServiceItem } from "@/data/services/catalog";

const TIER: Record<string, { label: string; variant: "success" | "booking" | "accent" }> = {
  budget: { label: "Ekonomik", variant: "success" },
  mid: { label: "Orta segment", variant: "booking" },
  lux: { label: "Lüks / Premium", variant: "accent" },
};

export function HotelCard({ item }: { item: ServiceItem }) {
  const tier = item.tier ? TIER[item.tier] : undefined;
  const amenities = item.amenities ?? item.includes;
  const href = `/oteller/${item.slug}`;

  return (
    <Card variant="interactive" className="flex h-full flex-col">
      <Link href={href} className="group relative block h-44 overflow-hidden bg-slate-100" aria-label={item.name}>
        {item.photoUrl ? (
          <NextImage
            src={item.photoUrl}
            alt={`${item.name} — ${item.region ?? "Kapadokya"}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out-strong group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary-light">
            <span className="text-6xl opacity-90 drop-shadow" aria-hidden>🏛️</span>
          </div>
        )}
        {tier && (
          <span className="absolute left-3 top-3 z-10">
            <Badge variant={tier.variant} size="sm" className="shadow-sm">{tier.label}</Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-slate-900">
            <Link href={href} className="hover:text-booking-700">{item.name}</Link>
          </h3>
        </div>

        {item.region && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-booking-600" aria-hidden /> {item.region}
          </p>
        )}

        <div className="mt-2.5">
          <ReviewScore rating={item.rating} count={item.reviewCount} format="ten" size="sm" />
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
          {item.shortDescription}
        </p>

        <AmenityChips items={amenities} max={3} className="mt-3" />

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <div className="text-sm font-bold text-primary">Size özel fiyat</div>
            <div className="text-[11px] text-slate-500">Uzman ekip teklif hazırlar</div>
          </div>
          <Button asChild variant="accent" size="sm">
            <Link href={href}>
              Fiyat teklifi al
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
