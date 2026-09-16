"use client";

// Hizmet detay videosu. Tarayicilar sesli autoplay'i engeller: muted+loop autoplay,
// tek tikla ses acilir. prefers-reduced-motion -> sadece poster. Ekran disindayken
// pause (mobil pil / veri).

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLocale } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { ServiceVideo as ServiceVideoSrc } from "@/data/services/videos";

const SOUND_LABEL: Partial<Record<Locale, { on: string; off: string }>> = {
  tr: { on: "Sesi aç", off: "Sesi kapat" },
  en: { on: "Turn sound on", off: "Mute" },
  de: { on: "Ton einschalten", off: "Stumm" },
  fr: { on: "Activer le son", off: "Couper le son" },
  es: { on: "Activar sonido", off: "Silenciar" },
  nl: { on: "Geluid aan", off: "Dempen" },
  zh: { on: "打开声音", off: "静音" },
  hi: { on: "आवाज़ चालू करें", off: "म्यूट" },
  ur: { on: "آواز آن کریں", off: "خاموش" },
  pt: { on: "Ativar som", off: "Silenciar" },
  "pt-BR": { on: "Ativar som", off: "Silenciar" },
  ja: { on: "音声をオン", off: "ミュート" },
  ko: { on: "소리 켜기", off: "음소거" },
  it: { on: "Attiva audio", off: "Disattiva audio" },
  ru: { on: "Включить звук", off: "Без звука" },
  uk: { on: "Увімкнути звук", off: "Без звуку" },
  az: { on: "Səsi aç", off: "Səssiz" },
};

interface Props {
  video: ServiceVideoSrc;
  alt: string;
  className?: string;
}

export function ServiceVideo({ video, alt, className = "" }: Props) {
  const { locale } = useLocale();
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const label = SOUND_LABEL[locale] ?? SOUND_LABEL.en!;

  if (reduced) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={video.poster} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
  }

  return (
    <>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        muted={muted}
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
      <button
        type="button"
        onClick={() => {
          const el = ref.current;
          const next = !muted;
          setMuted(next);
          if (el) {
            el.muted = next;
            if (!next) void el.play().catch(() => {});
          }
        }}
        aria-label={muted ? label.on : label.off}
        aria-pressed={!muted}
        className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/75"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        <span>{muted ? label.on : label.off}</span>
      </button>
    </>
  );
}
