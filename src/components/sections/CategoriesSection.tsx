"use client";

import type { ComponentProps } from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import {
  Wind,
  Hotel,
  Car,
  MountainSnow,
  TreePine,
  Package,
  PartyPopper,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";

export function CategoriesSection() {
  const t = useT();

  const CATEGORIES = [
    {
      icon: Wind,
      name: t.categories.balloons,
      sub: t.categories.balloons_sub,
      href: "/balonlar",
      featured: true,
      bg: "/images/balloons/standart-balon-ucusu.jpg",
    },
    {
      icon: Hotel,
      name: t.categories.hotels,
      sub: t.categories.hotels_sub,
      href: "/oteller",
      bg: "/images/hotels/magara-otel-deluxe.jpg",
    },
    {
      icon: Car,
      name: t.categories.transfer,
      sub: t.categories.transfer_sub,
      href: "/transferler",
      bg: "/images/transfers/vip-arac.jpg",
    },
    {
      icon: MountainSnow,
      name: t.categories.atv,
      sub: t.categories.atv_sub,
      href: "/aktiviteler",
      bg: "/images/activities/atv-sunset.jpg",
    },
    {
      icon: TreePine,
      name: t.categories.tours,
      sub: t.categories.tours_sub,
      href: "/turlar",
      bg: "/images/tours/kirmizi-tur.jpg",
    },
    {
      icon: Package,
      name: t.categories.packages,
      sub: t.categories.packages_sub,
      href: "/paketler",
      bg: "/images/packages/balayi-paketi.jpg",
    },
    {
      icon: PartyPopper,
      name: t.categories.horse,
      sub: t.categories.horse_sub,
      href: "/aktiviteler",
      bg: "/images/activities/at-sunset.jpg",
    },
    {
      icon: Shield,
      name: t.categories.insurance,
      sub: t.categories.insurance_sub,
      href: "/iletisim",
      bg: "/images/hero/homepage.jpg",
    },
  ];

  return (
    <section className="section-padding bg-slate-50">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="section-tag">{t.categories.tag}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.categories.title}
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            {t.categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              // href may be a shared route or a "#" placeholder (insurance) — cast.
              href={cat.href as ComponentProps<typeof Link>["href"]}
              className={cn(
                "group relative flex flex-col items-center text-center p-6 rounded-booking overflow-hidden text-white shadow-booking-card transition-[transform,box-shadow] duration-200 ease-out-strong",
                "hover:-translate-y-0.5 hover:shadow-booking-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.45]",
                cat.featured && "ring-2 ring-accent"
              )}
            >
              {/* Arka plan foto + koyu gradient overlay (metin/ikon okunur) */}
              <NextImage
                src={cat.bg}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-[900ms] ease-out-strong group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="relative font-bold text-sm drop-shadow">{cat.name}</span>
              <span className="relative text-xs mt-1 text-white/80 drop-shadow">
                {cat.sub}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
