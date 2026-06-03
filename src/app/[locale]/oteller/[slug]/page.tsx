// /oteller/[slug] — otel info-only page (rezervasyon yok, sadece bilgilendirme + form).
//
// Importers: Next route auto-discovery.
// Affected: /oteller list → her otel detayi. CTA = HotelInquiryForm + telefon/WhatsApp.
// User: "musteri otel icin bizimle telefonla irtibata gecmesi gerekiyor.
//        birkac tane otelin genel foto ve bilgilerini paylasairiz."

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/layout/JsonLd";
import { HOTELS } from "@/data/services/catalog";
import { breadcrumbSchema, lodgingSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, canonicalFor } from "@/lib/hreflang";
import { OtelDetayContent } from "./OtelDetayContent";

export const runtime = "edge";

interface PageParams {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return HOTELS.map((h) => ({ slug: h.slug }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const hotel = HOTELS.find((h) => h.slug === params.slug);
  if (!hotel) return { title: "Otel Bulunamadı" };
  const path = `/oteller/${hotel.slug}`;
  return {
    title: `${hotel.name} — Bilgi & İletişim | Trip and Tick`,
    description: hotel.shortDescription,
    alternates: { canonical: canonicalFor(path, params.locale), languages: generateHreflang(path) },
    openGraph: {
      title: hotel.name,
      description: hotel.shortDescription,
      url: `${SITE_URL}${path}`,
      type: "website",
    },
  };
}

export default function HotelDetailPage({ params }: PageParams) {
  const hotel = HOTELS.find((h) => h.slug === params.slug);
  if (!hotel) notFound();

  const amenities = hotel.amenities ?? hotel.includes;

  return (
    <>
      <OtelDetayContent hotel={hotel} />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Oteller", href: "/oteller" },
            { name: hotel.name, href: `/oteller/${hotel.slug}` },
          ]),
          lodgingSchema({
            slug: hotel.slug,
            name: hotel.name,
            description: hotel.shortDescription,
            rating: hotel.rating,
            reviewCount: hotel.reviewCount,
            region: hotel.region,
            amenities,
            priceRange:
              hotel.tier === "lux"
                ? "€€€"
                : hotel.tier === "mid"
                  ? "€€"
                  : "€",
          }),
        ]}
      />
    </>
  );
}
