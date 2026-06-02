"use client";

// Importers: page.tsx (oteller/[slug])
// Affected: hotel detail JSX body — booking.com property-page dili + contact-only.
// Data: hotel prop (ServiceItem from @/data/services/catalog)
// i18n-debt: bazi yeni string'ler TR hardcode (mevcut hardcode precedent).

import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { HotelInquiryForm } from "@/components/oteller/HotelInquiryForm";
import { useT } from "@/lib/i18n/I18nProvider";
import { MapPin, Phone, MessageSquare, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { ReviewScore } from "@/components/ui/ReviewScore";
import { AmenityChips } from "@/components/ui/AmenityChips";
import type { ServiceItem } from "@/data/services/catalog";

type TierStrings = {
  tier_ucuz_ekonomik: string;
  tier_orta_halli: string;
  tier_luks_premium: string;
  tier_standart: string;
};

function tierBadge(
  tier: string | undefined,
  ts: TierStrings
): { label: string; variant: "success" | "booking" | "accent" | "neutral" } {
  if (tier === "budget") return { label: ts.tier_ucuz_ekonomik, variant: "success" };
  if (tier === "mid") return { label: ts.tier_orta_halli, variant: "booking" };
  if (tier === "lux") return { label: ts.tier_luks_premium, variant: "accent" };
  return { label: ts.tier_standart, variant: "neutral" };
}

interface OtelDetayContentProps {
  hotel: ServiceItem;
}

export function OtelDetayContent({ hotel }: OtelDetayContentProps) {
  const t = useT();
  const ts = t.page.oteller.slug;

  const tier = tierBadge(hotel.tier, ts);
  const amenities = hotel.amenities ?? hotel.includes;

  return (
    <>
      <Breadcrumb
        items={[
          { name: ts.oteller_breadcrumb, href: "/oteller" },
          { name: hotel.name, href: `/oteller/${hotel.slug}` },
        ]}
      />

      <article className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden rounded-booking border border-slate-200 bg-white shadow-booking-card">
                <div className="relative h-72 bg-slate-100">
                  {hotel.photoUrl ? (
                    <NextImage
                      src={hotel.photoUrl}
                      alt={`${hotel.name} — ${hotel.region ?? "Kapadokya"}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary-light">
                      <span className="text-8xl opacity-90 drop-shadow-lg" aria-hidden="true">🏛️</span>
                    </div>
                  )}
                  <span className="absolute left-4 top-4">
                    <Badge variant={tier.variant} className="shadow-sm">{tier.label}</Badge>
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {hotel.region && (
                      <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-booking-600" aria-hidden /> {hotel.region}
                      </span>
                    )}
                    <ReviewScore rating={hotel.rating} count={hotel.reviewCount} format="ten" size="sm" />
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-slate-900">{hotel.name}</h1>
                  <p className="leading-relaxed text-slate-600">{hotel.shortDescription}</p>
                </div>
              </div>

              <div className="rounded-booking border border-slate-200 bg-white p-6 shadow-booking-card">
                <h2 className="mb-4 text-lg font-bold text-slate-900">{ts.olanaklar}</h2>
                <AmenityChips items={amenities} max={amenities.length} />
              </div>

              {/* Contact-only — booking-blue, pozitif cerceve (impeccable: side-stripe yok). */}
              <Banner variant="info" title={ts.otel_rezervasyonu_telefon_posta}>
                <p className="mb-3">
                  {ts.otel_musaitligi_guncel_fiyat} <b>{ts.uygun_secenekler_musaitlik}</b>{" "}
                  {ts.paylasacagiz_acil_iletisim}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="booking" size="sm">
                    <a href="tel:+905374647861"><Phone className="h-4 w-4" aria-hidden /> +90 537 464 78 61</a>
                  </Button>
                  <Button asChild variant="whatsapp" size="sm">
                    <a href="https://wa.me/905374647861"><MessageSquare className="h-4 w-4" aria-hidden /> {ts.whatsapp}</a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href="mailto:hello@tripandtick.com"><Mail className="h-4 w-4" aria-hidden /> {ts.eposta_buton}</a>
                  </Button>
                </div>
              </Banner>

              <div className="text-sm">
                <Link href="/oteller" className="btn-link">{ts.diger_otel_seceneklerini_gor}</Link>
              </div>
            </div>

            <aside className="self-start lg:sticky lg:top-24">
              <HotelInquiryForm hotelSlug={hotel.slug} hotelName={hotel.name} tier={hotel.tier} region={hotel.region} />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
