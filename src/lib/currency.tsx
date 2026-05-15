"use client";

// Multi-currency Context + utilities.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: src/components/booking/CurrencySwitcher.tsx (yeni),
//          src/components/layout/Footer.tsx (Edit — switcher mount),
//          src/app/layout.tsx (Edit — Provider wrap),
//          src/app/hesabim/page.tsx (yeni).
// Glob check: src/lib/currency*.ts* previously empty.
// Data: RATES sabit obje (EUR baz: TRY 35.2, USD 1.08, GBP 0.85);
//       localStorage key "tripandtick:currency"; client-side only.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CurrencyCode = "EUR" | "TRY" | "USD" | "GBP";

export const RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  TRY: 35.2,
  USD: 1.08,
  GBP: 0.85,
};

export const CURRENCY_LABELS: Record<CurrencyCode, { symbol: string; label: string; flag: string }> = {
  EUR: { symbol: "€", label: "Euro", flag: "EU" },
  TRY: { symbol: "₺", label: "Turk Lirasi", flag: "TR" },
  USD: { symbol: "$", label: "US Dollar", flag: "US" },
  GBP: { symbol: "£", label: "British Pound", flag: "GB" },
};

const STORAGE_KEY = "tripandtick:currency";
const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && v in RATES;
}

export function convertPrice(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const inEur = amount / RATES[from];
  return inEur * RATES[to];
}

export function formatPrice(amount: number, currency: CurrencyCode, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? 0;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (amount: number, from?: CurrencyCode) => number;
  format: (amount: number, from?: CurrencyCode) => string;
  ready: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isCurrencyCode(stored) && stored !== currency) {
        setCurrencyState(stored);
      }
    } catch {
      // ignore
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      convert: (amount: number, from: CurrencyCode = "EUR") => convertPrice(amount, from, currency),
      format: (amount: number, from: CurrencyCode = "EUR") =>
        formatPrice(convertPrice(amount, from, currency), currency),
      ready,
    }),
    [currency, setCurrency, ready]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => undefined,
      convert: (a) => a,
      format: (a) => formatPrice(a, DEFAULT_CURRENCY),
      ready: false,
    };
  }
  return ctx;
}
