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
  isLocale,
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

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with DEFAULT_LOCALE on both server and first client render to avoid
  // hydration mismatch. After mount we hydrate from localStorage.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored) && stored !== locale) {
        setLocaleState(stored);
        if (typeof document !== "undefined") {
          document.documentElement.lang = stored;
          document.documentElement.dir = LOCALE_DIR[stored];
        }
      } else if (typeof document !== "undefined") {
        document.documentElement.lang = locale;
        document.documentElement.dir = LOCALE_DIR[locale];
      }
    } catch {
      // localStorage may throw (private mode, quota, etc.) — fall back silently.
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
