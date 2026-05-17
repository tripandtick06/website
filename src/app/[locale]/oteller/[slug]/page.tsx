// /oteller/[slug] — otel info-only page (rezervasyon yok, sadece bilgilendirme + form).
//
// Importers: Next route auto-discovery.
// Affected: /oteller list → her otel detayi. CTA = HotelInquiryForm + telefon/WhatsApp.
// User: "musteri otel icin bizimle telefonla irtibata gecmesi gerekiyor.
//        birkac tane otelin genel foto ve bilgilerini paylasairiz."

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/layout/JsonLd";
import { HotelInquiryForm } from "@/components/oteller/HotelInquiryForm";
import { HOTELS } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";
import { Star, MapPin, Check, Phone, MessageSquare, Mail } from "lucide-react";

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
    alternates: { canonical: `${SITE_URL}${path}`, languages: generateHreflang(path) },
    openGraph: {
      title: hotel.name,
      description: hotel.shortDescription,
      url: `${SITE_URL}${path}`,
      type: "website",
    },
  };
}

function tierLabel(tier?: string): { label: string; cls: string } {
  if (tier === "budget") return { label: "Ucuz / Ekonomik", cls: "bg-emerald-100 text-emerald-700" };
  if (tier === "mid") return { label: "Orta Halli", cls: "bg-amber-100 text-amber-700" };
  if (tier === "lux") return { label: "Lüks / Premium", cls: "bg-rose-100 text-rose-700" };
  return { label: "Standart", cls: "bg-slate-100 text-slate-700" };
}

export default function HotelDetailPage({ params }: PageParams) {
  const hotel = HOTELS.find((h) => h.slug === params.slug);
  if (!hotel) notFound();

  const tier = tierLabel(hotel.tier);
  const amenities = hotel.amenities ?? hotel.includes;

  return (
    <>
      <Breadcrumb
        items={[
          { name: "Oteller", href: "/oteller" },
          { name: hotel.name, href: `/oteller/${hotel.slug}` },
        ]}
      />

      <article className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="h-72 bg-gradient-to-br from-amber-400/80 to-amber-600 flex items-center justify-center">
                  <span className="text-8xl opacity-90 drop-shadow-lg" aria-hidden="true">🏛️</span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${tier.cls}`}>{tier.label}</span>
                    {hotel.region && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5" /> {hotel.region}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {hotel.rating} ({hotel.reviewCount} değerlendirme)
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{hotel.name}</h1>
                  <p className="text-slate-600 leading-relaxed">{hotel.shortDescription}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Olanaklar</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                <h3 className="font-bold text-amber-900 mb-2">Otel rezervasyonu telefon / e-posta ile</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Otel müsaitliği ve güncel fiyat tarihe göre değişir. Yan formu doldurun — sizi 24 saat içinde
                  arayarak <b>uygun seçenekler, müsaitlik ve fiyat teklifi</b> paylaşacağız. Acil iletişim için
                  doğrudan telefon veya WhatsApp.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <a href="tel:+905374647861" className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                    <Phone className="w-4 h-4" /> +90 537 464 78 61
                  </a>
                  <a href="https://wa.me/905374647861" className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href="mailto:hello@tripandtick.com" className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold">
                    <Mail className="w-4 h-4" /> E-posta
                  </a>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                <Link href="/oteller" className="hover:underline">← Diğer otel seçeneklerini gör</Link>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <HotelInquiryForm hotelSlug={hotel.slug} hotelName={hotel.name} tier={hotel.tier} region={hotel.region} />
            </aside>
          </div>
        </div>
      </article>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Oteller", href: "/oteller" },
          { name: hotel.name, href: `/oteller/${hotel.slug}` },
        ])}
      />
    </>
  );
}
