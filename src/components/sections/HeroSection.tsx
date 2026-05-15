"use client";

import { MapPin } from "lucide-react";
import { SearchWidget } from "@/components/booking/SearchWidget";

export function HeroSection() {
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
          Nevşehir / Kapadokya
        </span>
      </div>

      {/* Heading */}
      <h1 className="relative text-center text-white font-black tracking-tight leading-[1.08] mb-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
        Kapadokya&apos;nın
        <br />
        <span className="text-accent">En İyi Deneyimleri</span>
        <br />
        En Uygun Fiyatla
      </h1>

      {/* Subtitle */}
      <p className="relative text-white/65 text-center max-w-xl mb-10 text-base sm:text-lg font-normal">
        Balon turlarından otel rezervasyonuna, ATV turlarından özel paketlere
        — tek platformda, şeffaf fiyatlarla.
      </p>

      {/* Search Widget */}
      <div className="relative w-full max-w-[920px]">
        <SearchWidget />
      </div>
    </section>
  );
}
