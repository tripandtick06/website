"use client";

// Form hunisi: form_start (ilk odak) + form_abandon (pagehide'da başlamış ama gönderilmemişse).
// DB events.name CHECK kısıtı yalnız 7 ada izin verir (0006_events.sql) → yeni ad EKLEMEDİK;
// bu ikisi click/kind=track/label=… olarak gider. Props'ta alan değeri YOK.
// Not: SPA rota değişiminde (pagehide yok) terk sayılmaz — yalnız sayfa kapanışı/yenileme.

import { useEffect, useRef } from "react";
import { track, trackBeacon } from "@/components/analytics/Tracker";

export function useFormFunnel(form: string) {
  const started = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    const onHide = () => {
      if (started.current && !finished.current) {
        finished.current = true;
        trackBeacon("click", { kind: "track", label: "form_abandon", form });
      }
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [form]);

  return {
    /** <form onFocusCapture={funnel.onFocus}> */
    onFocus: () => {
      if (started.current) return;
      started.current = true;
      finished.current = false;
      track("click", { kind: "track", label: "form_start", form });
    },
    /** Gönderim denendiğinde/başarıda çağır; sonraki odakta yeniden başlar. */
    done: () => {
      finished.current = true;
      started.current = false;
    },
  };
}
