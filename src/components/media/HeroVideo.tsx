"use client";

// Ana sayfa hero arka plan videosu. Poster (NextImage, priority) LCP'yi tasir;
// video canplay olunca ustune fade-in. Portrait ekranda 9:16, aksi halde 16:9 dosya.
// Sessiz + loop (hero'da ses yok; autoplay sesli zaten engelli). reduced-motion -> poster.

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { HERO_VIDEO } from "@/data/services/videos";

interface Props {
  alt: string;
}

export function HeroVideo({ alt }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const portrait = window.matchMedia("(orientation: portrait) and (max-width: 767px)").matches;
    setSrc(portrait ? HERO_VIDEO.portrait : HERO_VIDEO.landscape);
  }, []);

  return (
    <>
      <NextImage
        src={HERO_VIDEO.poster}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {src && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </>
  );
}
