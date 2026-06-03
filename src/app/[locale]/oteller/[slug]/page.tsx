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
import { breadcrumbSchema, lodgingSchema } from "@/lib/schema";
import { generateHreflang, canonicalFor, ogLocale } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { OtelDetayContent } from "./OtelDetayContent";

export const dynamic = "force-static";

interface PageParams {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return HOTELS.map((h) => ({ slug: h.slug }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const hotel = HOTELS.find((h) => h.slug === params.slug);
  if (!hotel) return { title: "Otel Bulunamadı" };
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const path = `/oteller/${hotel.slug}`;
  const geo = loc === "tr" ? "Kapadokya" : "Cappadocia";
  // Enriched description: geo context + CTA, capped <155 chars.
  const cta = loc === "tr" ? "Bilgi & rezervasyon için bize ulaşın." : "Contact us for info & booking.";
  const enrichedDesc = `${hotel.name} — ${geo}. ${hotel.shortDescription} ${cta}`.slice(0, 154);
  return {
    title: `${hotel.name} — ${geo} | Trip and Tick`,
    description: enrichedDesc,
    alternates: { canonical: canonicalFor(path, params.locale), languages: generateHreflang(path) },
    openGraph: {
      locale: ogLocale(loc),
      title: hotel.name,
      description: enrichedDesc,
      url: canonicalFor(path, params.locale),
      type: "website",
    },
  };
}

export default function HotelDetailPage({ params }: PageParams) {
  const hotel = HOTELS.find((h) => h.slug === params.slug);
  if (!hotel) notFound();

  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const detailUrl = canonicalFor(`/oteller/${hotel.slug}`, loc);
  const amenities = hotel.amenities ?? hotel.includes;

  return (
    <>
      <OtelDetayContent hotel={hotel} />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: serverDict(loc).nav.hotels, href: canonicalFor("/oteller", loc) },
            { name: hotel.name, href: detailUrl },
          ]),
          lodgingSchema({
            slug: hotel.slug,
            name: hotel.name,
            description: hotel.shortDescription,
            rating: hotel.rating,
            reviewCount: hotel.reviewCount,
            region: hotel.region,
            amenities,
            urlPath: detailUrl,
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
