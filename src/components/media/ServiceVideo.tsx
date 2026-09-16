"use client";

// Hizmet detay videosu. Tarayicilar sesli autoplay'i engeller: muted+loop autoplay,
// kosedeki tek ikon sesi acar. prefers-reduced-motion -> autoplay yok, poster durur.
// (Chrome ekran disi muted videoyu zaten durdurur — ekstra observer yok.)

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLocale } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { ServiceVideo as ServiceVideoSrc } from "@/data/services/videos";

// Sadece aria-label (gorunur metin yok) — ekran okuyucu icin.
const SOUND_LABEL: Partial<Record<Locale, [string, string]>> = {
  tr: ["Sesi aç", "Sesi kapat"],
  en: ["Turn sound on", "Mute"],
  de: ["Ton einschalten", "Stumm"],
  fr: ["Activer le son", "Couper le son"],
  es: ["Activar sonido", "Silenciar"],
  nl: ["Geluid aan", "Dempen"],
  zh: ["打开声音", "静音"],
  hi: ["आवाज़ चालू करें", "म्यूट"],
  ur: ["آواز آن کریں", "خاموش"],
  pt: ["Ativar som", "Silenciar"],
  "pt-BR": ["Ativar som", "Silenciar"],
  ja: ["音声をオン", "ミュート"],
  ko: ["소리 켜기", "음소거"],
  it: ["Attiva audio", "Disattiva audio"],
  ru: ["Включить звук", "Без звука"],
  uk: ["Увімкнути звук", "Без звуку"],
  az: ["Səsi aç", "Səssiz"],
};

interface Props {
  video: ServiceVideoSrc;
  alt: string;
}

export function ServiceVideo({ video, alt }: Props) {
  const { locale } = useLocale();
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    setAutoplay(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const [onLabel, offLabel] = SOUND_LABEL[locale] ?? SOUND_LABEL.en!;

  const toggle = () => {
    const el = ref.current;
    const next = !muted;
    setMuted(next);
    if (el) {
      el.muted = next;
      void el.play().catch(() => {});
    }
  };

  return (
    <>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        muted={muted}
        loop
        playsInline
        autoPlay={autoplay}
        preload="metadata"
        aria-label={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? onLabel : offLabel}
        aria-pressed={!muted}
        className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
    </>
  );
}
