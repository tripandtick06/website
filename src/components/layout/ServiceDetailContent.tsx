"use client";

// Aktivite / tur / paket / transfer detay (landing) sayfa govdesi — tek paylasilan
// component, 4 kategori route'u tarafindan kullanilir. Item zaten lokalize gelir.
// CTA -> /rezervasyon/<slug> (checkout). H1 SSR HTML'de render edilir.

import type { ComponentProps } from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Star, Clock, Check, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";
import { useUiText } from "@/lib/i18n/uiText";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LivePrice } from "@/components/pricing/LivePrice";
import type { ServiceItem } from "@/data/services/catalog";

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

  return (
    <>
      <Breadcrumb
        items={[
          { name: categoryLabel, href: categoryHref },
          { name: item.name, href: `${categoryHref}/${item.slug}` },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-main grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Gorsel */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-booking bg-slate-100">
            {item.photoUrl ? (
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

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-5">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                {item.rating} · {item.reviewCount.toLocaleString("tr-TR")}{" "}
                {t.component.layout.service_card.degerlendirme}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.duration}
              </span>
            </div>

            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              {item.shortDescription}
            </p>

            {item.highlights?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {item.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 bg-accent/[0.08] text-accent text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {h}
                  </span>
                ))}
              </div>
            )}

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

            <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                {showPrice ? (
                  <>
                    {item.marketPrice && item.marketPrice > item.adultPrice && (
                      <div className="text-sm text-slate-400 line-through">
                        {formatPrice(item.marketPrice, item.currency)}
                      </div>
                    )}
                    <div className="text-3xl font-extrabold text-primary leading-none">
                      <LivePrice
                        slug={item.slug}
                        fallback={item.adultPrice}
                        format={(n) => formatPrice(n, item.currency)}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.priceUnit === "couple"
                        ? ui.serviceCard.perCouple
                        : t.component.layout.service_card.kisi_basi}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-extrabold text-primary">
                    {t.component.layout.service_card.bilgi_al}
                  </div>
                )}
              </div>
              <Link
                href={reserveHref as ComponentProps<typeof Link>["href"]}
                className="btn-accent flex-shrink-0"
              >
                {showPrice ? ui.serviceCard.reserve : ui.serviceCard.infoForm}
              </Link>
            </div>
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
