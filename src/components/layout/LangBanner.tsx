"use client";

// Dil banner'i (2026-10-16): kok "/" herkese Turkce — yonlendirme YOK (SEO), bunun yerine
// tarayici dili tr degilse kucuk, kapatilabilir ust serit: "Continue in English →".
// - Sadece TR sayfada; cookie lang_banner=1 varsa gosterme.
// - Hedef dil: navigator.languages'ten gelen, yayindaki ilk eslesme (pt-BR once tam, sonra taban), yoksa en.
// - Esdeger URL: sayfanin kendi <link rel="alternate" hreflang> etiketinden (slug/parametre cozumu hazir).
// - Layout kaymasi yok: serit fixed; Header'in fixed top'u --lang-banner-h degiskeniyle iner (akistaki hicbir sey itilmez).

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { LANG_BANNER } from "@/lib/conversion-copy";

const COOKIE = "lang_banner";
const VAR = "--lang-banner-h";

function hasCookie(): boolean {
  try {
    return document.cookie.split("; ").some((c) => c === `${COOKIE}=1`);
  } catch {
    return true;
  }
}

function setCookie() {
  try {
    document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  } catch {
    /* cookie engelli: banner bu oturumda state ile kapanir */
  }
}

function pickTarget(langs: readonly string[]): Locale {
  for (const raw of langs) {
    const l = raw.toLowerCase();
    const exact = SUPPORTED_LOCALES.find((s) => s.toLowerCase() === l);
    if (exact && exact !== "tr") return exact;
    const base = l.split("-")[0];
    if (base === "pt") return "pt-BR";
    const b = SUPPORTED_LOCALES.find((s) => s.toLowerCase() === base);
    if (b && b !== "tr") return b;
  }
  return "en";
}

function alternateHref(target: Locale): string {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'));
  const hit = links.find((l) => l.hreflang.toLowerCase() === target.toLowerCase());
  if (hit) {
    try {
      const u = new URL(hit.href);
      return u.pathname + u.search;
    } catch {
      /* fall through */
    }
  }
  return `/${target}`;
}

export function LangBanner() {
  const { locale } = useLocale();
  const [state, setState] = useState<{ target: Locale; href: string } | null>(null);

  useEffect(() => {
    if (locale !== "tr" || hasCookie()) return;
    if ((navigator.language ?? "tr").toLowerCase().startsWith("tr")) return;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    const target = pickTarget(langs);
    setState({ target, href: alternateHref(target) });
  }, [locale]);

  useEffect(() => {
    const root = document.documentElement;
    if (state) root.style.setProperty(VAR, "36px");
    return () => {
      root.style.removeProperty(VAR);
    };
  }, [state]);

  if (!state) return null;
  const close = () => {
    setCookie();
    setState(null);
  };

  return (
    <div
      role="region"
      aria-label="Language"
      className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-center gap-3 bg-accent px-10 text-sm font-semibold text-white"
    >
      <a href={state.href} lang={state.target} hrefLang={state.target} onClick={setCookie} className="truncate underline-offset-2 hover:underline">
        {LANG_BANNER[state.target]}
      </a>
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/90 hover:bg-white/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
