"use client";

// Importers: page.tsx (oteller/[slug])
// Affected: hotel detail JSX body — chrome strings → useT()
// Data: hotel prop (ServiceItem from @/data/services/catalog)
// User verbatim: "JSX gövdesi YENİ OtelDetayContent.tsx"

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { HotelInquiryForm } from "@/components/oteller/HotelInquiryForm";
import { useT } from "@/lib/i18n/I18nProvider";
import { Star, MapPin, Check, Phone, MessageSquare, Mail } from "lucide-react";
import type { ServiceItem } from "@/data/services/catalog";

function tierLabel(
  tier: string | undefined,
  ts: {
    tier_ucuz_ekonomik: string;
    tier_orta_halli: string;
    tier_luks_premium: string;
    tier_standart: string;
  }
): { label: string; cls: string } {
  if (tier === "budget")
    return { label: ts.tier_ucuz_ekonomik, cls: "bg-emerald-100 text-emerald-700" };
  if (tier === "mid")
    return { label: ts.tier_orta_halli, cls: "bg-amber-100 text-amber-700" };
  if (tier === "lux")
    return { label: ts.tier_luks_premium, cls: "bg-rose-100 text-rose-700" };
  return { label: ts.tier_standart, cls: "bg-slate-100 text-slate-700" };
}

interface OtelDetayContentProps {
  hotel: ServiceItem;
}

export function OtelDetayContent({ hotel }: OtelDetayContentProps) {
  const t = useT();
  const ts = t.page.oteller.slug;

  const tier = tierLabel(hotel.tier, ts);
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
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {hotel.rating} ({hotel.reviewCount} {ts.degerlendirme}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{hotel.name}</h1>
                  <p className="text-slate-600 leading-relaxed">{hotel.shortDescription}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">{ts.olanaklar}</h2>
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
                <h3 className="font-bold text-amber-900 mb-2">{ts.otel_rezervasyonu_telefon_posta}</h3>
                <p className="text-sm text-amber-800 mb-3">
                  {ts.otel_musaitligi_guncel_fiyat}{" "}
                  <b>{ts.uygun_secenekler_musaitlik}</b>{" "}
                  {ts.paylasacagiz_acil_iletisim}
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <a href="tel:+905374647861" className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                    <Phone className="w-4 h-4" /> +90 537 464 78 61
                  </a>
                  <a href="https://wa.me/905374647861" className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                    <MessageSquare className="w-4 h-4" /> {ts.whatsapp}
                  </a>
                  <a href="mailto:hello@tripandtick.com" className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold">
                    <Mail className="w-4 h-4" /> {ts.eposta_buton}
                  </a>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                <Link href="/oteller" className="hover:underline">{ts.diger_otel_seceneklerini_gor}</Link>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <HotelInquiryForm hotelSlug={hotel.slug} hotelName={hotel.name} tier={hotel.tier} region={hotel.region} />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
