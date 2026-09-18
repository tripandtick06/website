"use client";

// Aktivite / tur / paket / transfer detay (landing) sayfa govdesi — tek paylasilan
// component, 4 kategori route'u tarafindan kullanilir. Item zaten lokalize gelir.
// CTA -> /rezervasyon/<slug> (checkout). H1 SSR HTML'de render edilir.

import type { ComponentProps } from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Clock, Check, Star, ShieldCheck } from "lucide-react";
import { WhatsAppAskLink } from "@/components/booking/WhatsAppAskLink";
import { useT } from "@/lib/i18n/I18nProvider";
import { useUiText } from "@/lib/i18n/uiText";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FromPrice } from "@/components/pricing/FromPrice";
import type { ServiceItem } from "@/data/services/catalog";
import { getServiceVideo } from "@/data/services/videos";
import { ServiceVideo } from "@/components/media/ServiceVideo";

export interface ServiceDetailContentProps {
  /** Lokalize edilmis ServiceItem. */
  item: ServiceItem;
  /** Kategori nav etiketi (orn "Aktiviteler"). */
  categoryLabel: string;
  /** Kategori listing path'i (orn "/aktiviteler") — Link lokalize eder. */
  categoryHref: string;
  /** Locale'e ozel uzun aciklama (varsa) — "Hakkında" bolumu. */
  longDescription?: string;
  /** "Hakkında" / "About" baslik etiketi (locale'e gore). */
  aboutLabel?: string;
}

export function ServiceDetailContent({
  item,
  categoryLabel,
  categoryHref,
  longDescription,
  aboutLabel,
}: ServiceDetailContentProps) {
  const t = useT();
  const ui = useUiText();
  const reserveHref = `/rezervasyon/${item.slug}`;
  const showPrice = !item.priceOnRequest;
  const video = getServiceVideo(item.slug);

  return (
    <>
      <Breadcrumb
        items={[
          { name: categoryLabel, href: categoryHref },
          { name: item.name, href: `${categoryHref}/${item.slug}` },
        ]}
      />

      {/* data-tt-product: Tracker bu sayfayı ürün görüntüleme olarak sayar */}
      <section className="section-padding bg-white" data-tt-product={item.slug}>
        <div className="container-main grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Gorsel: video varsa (aile klibi, 16:9) muted-loop video + ses ikonu; yoksa foto 4:3 */}
          <div className={`relative w-full overflow-hidden rounded-booking bg-slate-100 ${video ? "aspect-video" : "aspect-[4/3]"}`}>
            {video ? (
              <ServiceVideo video={video} alt={`${item.name} — Kapadokya`} />
            ) : item.photoUrl ? (
              <NextImage
                src={item.photoUrl}
                alt={`${item.name} — Kapadokya`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
            )}
            {item.badge && (
              <span className="absolute top-4 left-4 bg-white text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow">
                {item.badge}
              </span>
            )}
          </div>

          {/* Bilgi */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
              {item.name}
            </h1>

            {/* Sure + puan: dil-bagimsiz (sayi + yildiz), sosyal kanit tek satirda */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-5">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.duration}
              </span>
              {item.rating > 0 && item.reviewCount > 0 && (
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {item.rating.toFixed(1)}
                  <span className="font-normal text-slate-500">({item.reviewCount.toLocaleString()})</span>
                </span>
              )}
            </div>

            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              {item.shortDescription}
            </p>

            {/* highlights chip'leri kaldirildi: includes listesiyle ayni bilgiyi tekrarliyordu */}
            {item.includes?.length > 0 && (
              <ul className="space-y-2 mb-8">
                {item.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-slate-700">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                {showPrice ? (
                  <>
                    {/* Net fiyat yok — baslangic fiyati (guncel fiyat WhatsApp'tan) */}
                    <FromPrice slug={item.slug} price={item.adultPrice} currency={item.currency} priceClassName="text-3xl" labelClassName="text-sm" />
                    <div className="text-xs text-slate-500 mt-1">
                      {item.priceUnit === "couple"
                        ? ui.serviceCard.perCouple
                        : t.component.layout.service_card.kisi_basi}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-extrabold text-primary">
                    {item.category === "hotel" ? t.component.layout.service_card.bilgi_al : ui.serviceCard.askPrice}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <Link
                  href={reserveHref as ComponentProps<typeof Link>["href"]}
                  className="btn-accent text-center"
                >
                  {showPrice ? ui.serviceCard.reserve : ui.serviceCard.infoForm}
                </Link>
                <WhatsAppAskLink subject={item.name} />
              </div>
            </div>

            {/* Karar guveni: CTA'nin hemen altinda, footer'a kadar kaydirmadan */}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
              {[t.hero_trust.refund, t.hero_trust.insurance, t.hero_trust.tursab].map((label) => (
                <li key={label} className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {longDescription && (
        <section className="section-padding bg-slate-50">
          <div className="container-main max-w-3xl">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
              {aboutLabel ?? "Hakkında"} — {item.name}
            </h2>
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">
              {longDescription}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
