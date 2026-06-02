"use client";

// Client-only i18n provider. SSR-safe (no localStorage on server).
// User verbatim: "dil degismiyor. bu ilk hata."

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  LOCALE_DIR,
  LOCALE_STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (next: Locale) => void;
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  // URL route locale (layout'tan [locale] segmenti) source-of-truth'tur. Server ve
  // ilk client render ayni initialLocale ile baslar -> hydration mismatch yok +
  // /nl gibi prefixli URL'de icerik dogru dilde SSR olur (localStorage degil URL kazanir).
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  // Mount sonrasi: html lang/dir senkron + ready. localStorage URL'i EZMEZ (URL otorite).
  useEffect(() => {
    setReady(true);
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = LOCALE_DIR[locale];
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        // ignore storage failures
      }
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
      document.documentElement.dir = LOCALE_DIR[next];
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: DICTIONARIES[locale] as Dictionary,
      setLocale,
      ready,
    }),
    [locale, setLocale, ready]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Provider not mounted — fall back to defaults so components don't crash.
    return {
      locale: DEFAULT_LOCALE,
      t: DICTIONARIES[DEFAULT_LOCALE] as Dictionary,
      setLocale: () => undefined,
      ready: false,
    };
  }
  return ctx;
}

export function useT(): Dictionary {
  return useI18n().t;
}

export function useLocale(): { locale: Locale; setLocale: (next: Locale) => void } {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}
