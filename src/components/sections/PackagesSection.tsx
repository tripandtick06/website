"use client";

import type { ComponentProps } from "react";
import NextImage from "next/image";
import {
  Clock,
  Users,
  Wind,
  Heart,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";
import { FromPrice } from "@/components/pricing/FromPrice";
import { WhatsAppAskLink } from "@/components/booking/WhatsAppAskLink";
import { useUiText } from "@/lib/i18n/uiText";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { PACKAGES } from "@/data/services/catalog";

/** Slug ile katalogda garanti bulunan bir kaydi getirir (build-time statik veri). */
function findOrThrow<T extends { slug: string }>(arr: T[], slug: string): T {
  const found = arr.find((x) => x.slug === slug);
  if (!found) throw new Error(`PackagesSection: katalogda bulunamadi — ${slug}`);
  return found;
}

interface PackageCardProps {
  badge: string;
  badgeColor: "accent" | "success" | "warning";
  title: string;
  meta: { icon: React.ReactNode; text: string }[];
  includes: string[];
  slug: string;
  /** Katalog baslangic fiyati — canli taban fiyat varsa LivePrice ile degisir. */
  price: number;
  /** Paketler: fiyat gizli, "fiyat icin bilgi alin" + WhatsApp. */
  priceOnRequest?: boolean;
  unit: string;
  gradient: string;
  icon: React.ReactNode;
  reserveLabel: string;
  photo: string;
  href: string;
}

function PackageCard({
  badge,
  badgeColor,
  title,
  meta,
  includes,
  slug,
  price,
  priceOnRequest,
  unit,
  reserveLabel,
  photo,
  href,
}: PackageCardProps) {
  const ui = useUiText();
  const badgeColors = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
  };

  return (
    <div className="card overflow-hidden group">
      {/* Image Area — gercek foto + alt gradient (badge kontrasti) */}
      <div className="h-52 relative bg-slate-100 overflow-hidden">
        <NextImage
          src={photo}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out-strong group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        <span
          className={`absolute top-4 left-4 ${badgeColors[badgeColor]} text-white px-3 py-1 rounded-lg text-xs font-bold z-10`}
        >
          {badge}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h3>

        <div className="flex gap-4 mb-3">
          {meta.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              {m.icon}
              {m.text}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 mb-5">
          {includes.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-success shrink-0" />
              {item}
            </div>
          ))}
        </div>

        {/* Net fiyat yok: baslangic fiyati veya "fiyat icin bilgi alin"; yaninda WhatsApp (Murat) */}
        <div className="pt-4 border-t border-slate-100">
          <div className="mb-3">
            {priceOnRequest ? (
              <div className="text-xl font-black text-primary">{ui.serviceCard.askPrice}</div>
            ) : (
              <>
                <FromPrice slug={slug} price={price} priceClassName="text-2xl" labelClassName="text-xs" />
                <div className="text-xs text-slate-500">{unit}</div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={href as ComponentProps<typeof Link>["href"]} className="btn-accent flex flex-1 items-center justify-center gap-2 !text-sm !py-2.5 !px-5">
              {priceOnRequest ? ui.serviceCard.askPrice : reserveLabel} <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppAskLink compact subject={title} className="flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PackagesSection() {
  const t = useT();
  const reserveLabel = t.packages_section.reserve;
  const ps = t.component.sections.packages;

  // Katalogdan gercek fiyatlari cek — hardcoded stale degerler yasak (bkz. catalog.ts).
  const standartBalon = findOrThrow(BALLOON_PACKAGES, "standart-balon-ucusu");
  const balayiPaketi = findOrThrow(PACKAGES, "balayi-paketi");
  const maceraPaketi = findOrThrow(PACKAGES, "macera-paketi");

  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="section-tag">{t.packages_section.tag}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.packages_section.title}
            <span className="text-accent align-super text-lg">*</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            {t.packages_section.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-[1200px] mx-auto">
          <PackageCard
            reserveLabel={reserveLabel}
            badge={t.packages_section.standart_badge}
            badgeColor="accent"
            title={t.packages_section.standart_title}
            meta={[
              { icon: <Clock className="w-4 h-4" />, text: ps.standart_meta_sure },
              { icon: <Users className="w-4 h-4" />, text: ps.standart_meta_kisi },
            ]}
            includes={[
              ps.standart_include_transfer,
              ps.standart_include_kahvalti,
              ps.standart_include_sigorta,
              ps.standart_include_sertifika,
              ps.standart_include_sampanya,
            ]}
            slug={standartBalon.slug}
            price={standartBalon.adultPrice}
            unit={ps.unit_kisi_basi}
            gradient="bg-gradient-to-br from-primary to-accent"
            icon={<Wind className="w-24 h-24 text-white" />}
            photo="/images/balloons/standart-balon-ucusu.jpg"
            href={`/rezervasyon/${standartBalon.slug}`}
          />

          <PackageCard
            reserveLabel={reserveLabel}
            badge={t.packages_section.balayi_badge}
            badgeColor="warning"
            title={t.packages_section.balayi_title}
            meta={[
              { icon: <Wind className="w-4 h-4" />, text: ps.balayi_meta_balon },
              { icon: <Clock className="w-4 h-4" />, text: ps.balayi_meta_otel },
            ]}
            includes={[
              ps.balayi_include_delux_ucus,
              ps.balayi_include_magara_otel,
              ps.balayi_include_vip_transfer,
              ps.balayi_include_cicek_dekor,
              ps.balayi_include_fotograf,
            ]}
            slug={balayiPaketi.slug}
            price={balayiPaketi.adultPrice}
            priceOnRequest={balayiPaketi.priceOnRequest}
            unit={ps.unit_2_kisi_toplam}
            gradient="bg-gradient-to-br from-[#4A1A8B] to-accent"
            icon={<Heart className="w-24 h-24 text-white" />}
            photo="/images/packages/balayi-paketi.jpg"
            href={`/rezervasyon/${balayiPaketi.slug}`}
          />

          <PackageCard
            reserveLabel={reserveLabel}
            badge={t.packages_section.macera_badge}
            badgeColor="success"
            title={t.packages_section.macera_title}
            meta={[
              { icon: <Wind className="w-4 h-4" />, text: ps.macera_meta_balon },
              { icon: <Zap className="w-4 h-4" />, text: ps.macera_meta_atv },
            ]}
            includes={[
              ps.macera_include_standart_ucus,
              ps.macera_include_atv_turu,
              ps.macera_include_at_binme,
              ps.macera_include_transferler,
              ps.macera_include_rehber,
            ]}
            slug={maceraPaketi.slug}
            price={maceraPaketi.adultPrice}
            priceOnRequest={maceraPaketi.priceOnRequest}
            unit={ps.unit_kisi_basi}
            gradient="bg-gradient-to-br from-[#1A6B2B] to-[#4BBE6A]"
            icon={<Zap className="w-24 h-24 text-white" />}
            photo="/images/activities/atv-sunset.jpg"
            href={`/rezervasyon/${maceraPaketi.slug}`}
          />
        </div>

        {/* En dusuk fiyat garantisi — yildiz isaretli not (sadece paket satislari) */}
        <p className="mt-8 max-w-2xl mx-auto text-center text-xs text-slate-500 leading-relaxed">
          <span className="text-accent font-bold">*</span> {t.packages_section.price_match}
        </p>
      </div>
    </section>
  );
}
