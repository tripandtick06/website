"use client";

import NextImage from "next/image";
import { MapPin, ShieldCheck, Wallet, Users } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0F1B4D] overflow-hidden px-4 pt-[100px] pb-16">
      {/* Arka plan: etkileyici Kapadokya balon fotosu + koyu gradient overlay (metin okunur) */}
      <NextImage
        src="/images/hero/homepage.jpg"
        alt="Kapadokya sıcak hava balonları gün doğumu"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B4D]/85 via-primary/75 to-[#2A1A4A]/85" />

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
    </section>
  );
}
