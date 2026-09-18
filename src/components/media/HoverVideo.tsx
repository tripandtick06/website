"use client";

// Kart hover videosu: foto ustune muted-loop klip, sadece imlec kart uzerindeyken
// (veya klavye odakli iken) oynar. `preload="none"` — listing sayfasinda 20+ kart var,
// hover olmadan tek byte video inmez. prefers-reduced-motion → hic oynamaz (foto kalir).
// Dokunmatik cihazda hover yok → foto; detay sayfasindaki ServiceVideo zaten oynar.

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
}

export function HoverVideo({ src }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover)");
    setEnabled(!mq.matches && hover.matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    const card = el?.closest("article");
    if (!el || !card) return;

    const start = () => {
      setPlaying(true);
      void el.play().catch(() => {});
    };
    const stop = () => {
      setPlaying(false);
      el.pause();
      el.currentTime = 0;
    };
    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", stop);
    return () => {
      card.removeEventListener("mouseenter", start);
      card.removeEventListener("mouseleave", stop);
      card.removeEventListener("focusin", start);
      card.removeEventListener("focusout", stop);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}
