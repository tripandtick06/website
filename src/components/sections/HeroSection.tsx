"use client";

import { MapPin, ShieldCheck, Wallet, Users, BadgeCheck } from "lucide-react";
import { SearchWidget } from "@/components/booking/SearchWidget";
import { useT } from "@/lib/i18n/I18nProvider";

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0F1B4D] via-primary to-[#2A1A4A] overflow-hidden px-4 pt-[100px] pb-16">
      {/* Background Decorative Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-80 h-80 rounded-full bg-accent/[0.06] blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-primary-light/[0.1] blur-3xl" />
        <div className="absolute top-[60%] left-[60%] w-48 h-48 rounded-full bg-accent/[0.04] blur-2xl" />
      </div>

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 bg-accent/15 border border-accent/25 rounded-full px-5 py-2 mb-7">
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-slow" />
        <MapPin className="w-3.5 h-3.5 text-accent-light" />
        <span className="text-sm font-semibold text-accent-light">
          {t.hero.badge}
        </span>
      </div>

      {/* Heading */}
      <h1 className="relative text-center text-white font-black tracking-tight leading-[1.08] mb-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
        {t.hero.title1}
        <br />
        <span className="text-accent">{t.hero.title2}</span>
        <br />
        {t.hero.title3}
      </h1>

      {/* Subtitle */}
      <p className="relative text-white/65 text-center max-w-xl mb-10 text-base sm:text-lg font-normal">
        {t.hero.subtitle}
      </p>

      {/* Search Widget */}
      <div className="relative w-full max-w-[920px]">
        <SearchWidget />
      </div>

      {/* Trust Badges */}
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 max-w-3xl">
        <div className="flex items-center gap-2 bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-full px-4 py-2 text-white/90 text-xs sm:text-sm font-medium">
          <Wallet className="w-4 h-4 text-accent-light shrink-0" />
          <span>{t.hero_trust.refund}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-full px-4 py-2 text-white/90 text-xs sm:text-sm font-medium">
          <ShieldCheck className="w-4 h-4 text-accent-light shrink-0" />
          <span>{t.hero_trust.insurance}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-full px-4 py-2 text-white/90 text-xs sm:text-sm font-medium">
          <Users className="w-4 h-4 text-accent-light shrink-0" />
          <span>{t.hero_trust.operators}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-full px-4 py-2 text-white/90 text-xs sm:text-sm font-medium">
          <BadgeCheck className="w-4 h-4 text-accent-light shrink-0" />
          <span>{t.hero_trust.tursab}</span>
        </div>
      </div>
    </section>
  );
}
