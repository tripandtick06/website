"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";

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
  } catch {
    /* ignore */
  }
}

export default function CookieConsent() {
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
      aria-label="Çerez tercihi"
      className="fixed inset-x-0 bottom-0 z-[60] bg-slate-900 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="container-main py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-sm sm:text-base font-medium leading-relaxed">
              Bu site KVKK ve GDPR kapsamında deneyiminizi geliştirmek için
              çerezler kullanır. Detaylar için{" "}
              <Link
                href="/cerez-politikasi"
                className="underline decoration-accent underline-offset-2 hover:text-accent"
              >
                Çerez Politikamıza
              </Link>{" "}
              göz atın.
            </p>
            {details && (
              <ul className="mt-3 grid gap-1 text-xs text-slate-300 sm:grid-cols-2">
                <li>• Zorunlu çerezler (oturum, güvenlik) — her zaman aktif</li>
                <li>• Analitik (anonim ziyaret istatistikleri) — opsiyonel</li>
                <li>• Pazarlama (kişiselleştirilmiş içerik) — opsiyonel</li>
                <li>• Performans (sayfa hızı ölçümü) — opsiyonel</li>
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
              Kabul Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
