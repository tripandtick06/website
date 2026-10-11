"use client";

import NextImage from "next/image";
import { MapPin, ShieldCheck, Wallet, Users } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import { HeroVideo } from "@/components/media/HeroVideo";
import { QuickContactCard } from "@/components/booking/QuickContact";

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0F1B4D] overflow-hidden px-4 pt-[100px] pb-16">
      {/* Arka plan: poster foto (LCP) + uzerine sessiz loop video + koyu gradient overlay (metin okunur) */}
      <HeroVideo alt="Kapadokya sıcak hava balonları gün doğumu" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B4D]/75 via-primary/60 to-[#2A1A4A]/75" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-x-12 gap-y-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="flex flex-col items-center lg:items-start lg:row-span-2">
      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 bg-accent/15 border border-accent/25 rounded-full px-5 py-2 mb-7">
        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-slow" />
        <MapPin className="w-3.5 h-3.5 text-accent-light" />
        <span className="text-sm font-semibold text-accent-light">
          {t.hero.badge}
        </span>
      </div>

      {/* Heading */}
      <h1 className="relative text-center lg:text-left text-white font-black tracking-tight leading-[1.08] mb-5 text-4xl sm:text-5xl md:text-6xl">
        {t.hero.title1}
        <br />
        <span className="text-accent">{t.hero.title2}</span>
        <br />
        {t.hero.title3}
      </h1>

      {/* Subtitle */}
      <p className="relative text-white/65 text-center lg:text-left max-w-xl mb-4 text-base sm:text-lg font-normal">
        {t.hero.subtitle}
      </p>
      </div>

      {/* Hizli talep karti: mobilde H1/alt-baslik altinda, masaustunde sag kolon */}
      <QuickContactCard className="mx-auto lg:mx-0 lg:ml-auto lg:row-span-2 lg:col-start-2 lg:row-start-1" />

      {/* Trust Badges */}
      <div className="relative mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 max-w-3xl lg:col-start-1">
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
          <span className="flex items-center justify-center bg-white rounded-full p-0.5 shrink-0">
            <NextImage
              src="/images/tursab.png"
              alt="TÜRSAB üyesi operatörler"
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </span>
          <span>{t.hero_trust.tursab}</span>
        </div>
      </div>
      </div>
    </section>
  );
}
