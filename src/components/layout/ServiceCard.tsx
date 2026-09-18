"use client";

import type { ComponentProps } from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Clock, Check, Hotel, MountainSnow, TreePine, Package, Car, Wind } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import { useUiText } from "@/lib/i18n/uiText";
import { FromPrice } from "@/components/pricing/FromPrice";
import { WhatsAppAskLink } from "@/components/booking/WhatsAppAskLink";
import { HoverVideo } from "@/components/media/HoverVideo";
import type { ServiceItem } from "@/data/services/catalog";
import { getServiceVideo } from "@/data/services/videos";

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

// Her kategori kendi lokalize DETAY (landing) route'una gider — indexlenebilir
// sayfa; rezervasyon CTA detay sayfasinda. (Object-form Link locale prefix'i map'ler.)
const DETAIL_PATHNAME: Record<ServiceItem["category"], string> = {
  activity: "/aktiviteler/[slug]",
  tour: "/turlar/[slug]",
  hotel: "/oteller/[slug]",
  package: "/paketler/[slug]",
  transfer: "/transferler/[slug]",
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
  const emoji = slugEmoji(item.slug);
  // activity/tour/package/hotel -> lokalize DETAY route; transfer -> rezervasyon
  // (detay sayfasi yok). ctaHref override string Link kalir.
  const detailPathname = DETAIL_PATHNAME[item.category];
  const href = (
    ctaHref
      ? ctaHref
      : detailPathname
        ? { pathname: detailPathname, params: { slug: item.slug } }
        : `/rezervasyon/${item.slug}`
  ) as ComponentProps<typeof Link>["href"];
  const ctaLabel = isHotelInfoOnly
    ? ui.serviceCard.infoForm
    : item.priceOnRequest
      ? ui.serviceCard.askPrice
      : ui.serviceCard.reserve;
  // Hover'da aile klibi oynar (otelde video yok — AI video gercek oteli yaniltir).
  const video = getServiceVideo(item.slug);

  return (
    <article className="group/card overflow-hidden flex flex-col h-full rounded-booking border border-slate-200 bg-white shadow-booking-card transition-[transform,box-shadow] duration-200 ease-out-strong hover:-translate-y-0.5 hover:shadow-booking-hover">
      {/* Hero — photoUrl varsa Next/Image (+ hover video), yoksa gradient + emoji/icon fallback */}
      <div className={`relative h-48 ${item.photoUrl ? "bg-slate-100" : `bg-gradient-to-br ${gradient} flex items-center justify-center`}`}>
        {item.photoUrl ? (
          <>
            <NextImage
              src={item.photoUrl}
              alt={`${item.name} — Kapadokya`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-[900ms] ease-out-strong group-hover/card:scale-105"
            />
            {video && <HoverVideo src={video.src} />}
          </>
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
        </div>

        <ul className="text-xs text-slate-600 space-y-1 mb-4">
          {item.includes.slice(0, 3).map((inc) => (
            <li key={inc} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
              <span>{inc}</span>
            </li>
          ))}
        </ul>

        {/* Fiyat satiri: net fiyat yok — baslangic fiyati; her fiyatin yaninda WhatsApp (Murat) */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="mb-3 min-h-[2.25rem]">
            {item.priceOnRequest ? (
              <>
                <div className="text-lg font-extrabold text-primary leading-tight">
                  {isHotelInfoOnly ? t.component.layout.service_card.bilgi_al : ui.serviceCard.askPrice}
                </div>
                {isHotelInfoOnly && (
                  <div className="text-[10px] text-slate-500 mt-1">{t.component.layout.service_card.telefon_posta}</div>
                )}
              </>
            ) : (
              <>
                <FromPrice slug={item.slug} price={item.adultPrice} currency={item.currency} priceClassName="text-2xl" labelClassName="text-xs" />
                <div className="text-[10px] text-slate-500 mt-1">{item.priceUnit === "couple" ? ui.serviceCard.perCouple : t.component.layout.service_card.kisi_basi}</div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={href}
              className="btn-accent text-sm !py-2 !px-4 flex-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.45] focus-visible:ring-offset-1"
            >
              {ctaLabel}
            </Link>
            <WhatsAppAskLink compact subject={item.name} className="flex-shrink-0" />
          </div>
        </div>
      </div>
    </article>
  );
}
