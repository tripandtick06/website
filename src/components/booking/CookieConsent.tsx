"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";

const STORAGE_KEY = "tripandtick:consent";

type ConsentState = "accepted" | "rejected" | null;

function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "accepted" || v === "rejected") return v;
    return null;
  } catch {
    return null;
  }
}

function writeConsent(v: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
    window.localStorage.setItem(`${STORAGE_KEY}:ts`, String(Date.now()));
    // Analytics.tsx (ve diger consent-gated component'ler) ayni-tab guncellemesi icin.
    window.dispatchEvent(new Event("tripandtick:consent-change"));
  } catch {
    /* ignore */
  }
}

export default function CookieConsent() {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const current = readConsent();
    if (current === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    writeConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    writeConsent("rejected");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.component.booking.cookie_consent.div_aria_label_cerez_tercihi}
      className="fixed inset-x-0 bottom-0 z-[60] bg-slate-900 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="container-main py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-sm sm:text-base font-medium leading-relaxed">
              {t.component.booking.cookie_consent.site_kvkk_gdpr_kapsaminda}{" "}
              <Link
                href="/cerez-politikasi"
                className="underline decoration-accent underline-offset-2 hover:text-accent"
              >
                {t.component.booking.cookie_consent.cerez_politikamiza}
              </Link>{" "}
              {t.component.booking.cookie_consent.goz_atin}
            </p>
            {details && (
              <ul className="mt-3 grid gap-1 text-xs text-slate-300 sm:grid-cols-2">
                <li>{t.component.booking.cookie_consent.zorunlu_cerezler_oturum}</li>
                <li>{t.component.booking.cookie_consent.analitik_anonim_ziyaret}</li>
                <li>{t.component.booking.cookie_consent.pazarlama_kisisellestirilmis}</li>
                <li>{t.component.booking.cookie_consent.performans_sayfa_hizi_olcumu}</li>
              </ul>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setDetails((d) => !d)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              {details ? "Gizle" : "Detaylar"}
            </button>
            <button
              type="button"
              onClick={reject}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={accept}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white shadow-glow hover:bg-accent-dark"
            >
              {t.component.booking.cookie_consent.kabul_et}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
