"use client";

import type { ComponentProps } from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Star, Clock, Check, Hotel, MountainSnow, TreePine, Package, Car, Wind } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";
import { useUiText } from "@/lib/i18n/uiText";
import type { ServiceItem } from "@/data/services/catalog";

const CATEGORY_ICON: Record<ServiceItem["category"], typeof Wind> = {
  activity: MountainSnow,
  tour: TreePine,
  hotel: Hotel,
  package: Package,
  transfer: Car,
};

const CATEGORY_GRADIENT: Record<ServiceItem["category"], string> = {
  activity: "from-success/80 to-success",
  tour: "from-primary to-primary-light",
  hotel: "from-warning/80 to-warning",
  package: "from-accent to-accent-light",
  transfer: "from-slate-600 to-slate-700",
};

// Slug bazli emoji — daha dogru gorsel
function slugEmoji(slug: string): string | null {
  if (slug.startsWith("atv-")) return "🏍️";
  if (slug.startsWith("at-")) return "🐴";
  if (slug.startsWith("jeep-")) return "🚙";
  if (slug.includes("magara")) return "🏛️";
  if (slug.includes("resort") || slug.includes("aile")) return "🏨";
  if (slug.includes("butik")) return "🛏️";
  if (slug.includes("kirmizi")) return "🌅";
  if (slug.includes("yesil")) return "🌿";
  if (slug.includes("gun-batimi")) return "🌇";
  if (slug.includes("instagram")) return "📸";
  if (slug.includes("yeralti")) return "🏛️";
  if (slug.includes("balayi")) return "💍";
  if (slug.includes("macera")) return "🎢";
  if (slug.includes("evlilik")) return "💐";
  if (slug.includes("aile-paketi")) return "👨‍👩‍👧";
  if (slug.includes("tam-gun")) return "🌞";
  if (slug.includes("kurumsal")) return "🏢";
  if (slug.includes("nev-otel") || slug.includes("kayseri-otel")) return "✈️";
  if (slug.includes("minibus")) return "🚌";
  if (slug.includes("vip")) return "🚘";
  return null;
}

export interface ServiceCardProps {
  item: ServiceItem;
  ctaHref?: string;
}

export function ServiceCard({ item, ctaHref }: ServiceCardProps) {
  const t = useT();
  const ui = useUiText();
  const Icon = CATEGORY_ICON[item.category];
  const gradient = CATEGORY_GRADIENT[item.category];
  // Otel kategorisi info-only flow — /oteller/[slug] info page (rezervasyon yok).
  const isHotelInfoOnly = item.category === "hotel";
  // Hotel info page is a localized route → object form so the locale prefix maps.
  // Rezervasyon is NOT localized → plain string Link. ctaHref override stays string.
  const useLocalizedHotelHref = isHotelInfoOnly && !ctaHref;
  const stringHref = ctaHref || `/rezervasyon/${item.slug}`;
  const emoji = slugEmoji(item.slug);

  return (
    <article className="group/card overflow-hidden flex flex-col h-full rounded-booking border border-slate-200 bg-white shadow-booking-card transition-[transform,box-shadow] duration-200 ease-out-strong hover:-translate-y-0.5 hover:shadow-booking-hover">
      {/* Hero — photoUrl varsa Next/Image, yoksa gradient + emoji/icon fallback */}
      <div className={`relative h-48 ${item.photoUrl ? "bg-slate-100" : `bg-gradient-to-br ${gradient} flex items-center justify-center`}`}>
        {item.photoUrl ? (
          <NextImage
            src={item.photoUrl}
            alt={`${item.name} — Kapadokya`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : emoji ? (
          <span className="text-7xl opacity-90 drop-shadow-lg" aria-hidden="true">{emoji}</span>
        ) : (
          <Icon className="w-20 h-20 text-white/85" strokeWidth={1.4} />
        )}
        {item.badge && (
          <span className="absolute top-3 left-3 bg-white text-primary px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm z-10">
            {item.badge}
          </span>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 z-10">
          <Star className="w-3 h-3 fill-warning text-warning" />
          {item.rating}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug">
          {item.name}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-3 flex-1">
          {item.shortDescription}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.duration}
          </span>
          <span>·</span>
          <span>{item.reviewCount.toLocaleString("tr-TR")} {t.component.layout.service_card.degerlendirme}</span>
        </div>

        <ul className="text-xs text-slate-600 space-y-1 mb-4">
          {item.includes.slice(0, 3).map((inc) => (
            <li key={inc} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
              <span>{inc}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between gap-3 mt-auto pt-3 border-t border-slate-100">
          <div>
            {item.priceOnRequest ? (
              <>
                <div className="text-lg font-extrabold text-primary leading-tight">
                  {t.component.layout.service_card.bilgi_al}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{t.component.layout.service_card.telefon_posta}</div>
              </>
            ) : (
              <>
                {item.marketPrice && item.marketPrice > item.adultPrice && (
                  <div className="text-xs text-slate-400 line-through leading-none mb-0.5">
                    {formatPrice(item.marketPrice, item.currency)}
                  </div>
                )}
                <div className="text-2xl font-extrabold text-primary leading-none">
                  {formatPrice(item.adultPrice, item.currency)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{item.priceUnit === "couple" ? ui.serviceCard.perCouple : t.component.layout.service_card.kisi_basi}</div>
              </>
            )}
          </div>
          {useLocalizedHotelHref ? (
            <Link
              href={{ pathname: "/oteller/[slug]", params: { slug: item.slug } }}
              className="btn-accent text-sm !py-2 !px-4 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.45] focus-visible:ring-offset-1"
            >
              {ui.serviceCard.infoForm}
            </Link>
          ) : (
            <Link
              href={stringHref as ComponentProps<typeof Link>["href"]}
              className="btn-accent text-sm !py-2 !px-4 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.45] focus-visible:ring-offset-1"
            >
              {isHotelInfoOnly ? ui.serviceCard.infoForm : ui.serviceCard.reserve}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
