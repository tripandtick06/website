"use client";

// Currency dropdown switcher.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: src/components/layout/Footer.tsx (Edit — dil dropdown yanina).
// Glob check: **/Currency*.tsx previously empty.
// Data: useCurrency hook (no I/O).

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleDollarSign } from "lucide-react";
import { useCurrency, CURRENCY_LABELS, type CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const ORDER: CurrencyCode[] = ["EUR", "TRY", "USD", "GBP"];

interface Props {
  variant?: "header" | "footer";
}

export function CurrencySwitcher({ variant = "footer" }: Props) {
  const t = useT();
  const { currency, setCurrency, ready } = useCurrency();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const buttonCls =
    variant === "header"
      ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-all"
      : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/[0.12] hover:text-white transition-all";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonCls}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.component.booking.currency_switcher.button_aria_label_para_birimi}
        disabled={!ready}
      >
        <CircleDollarSign className={variant === "header" ? "w-4 h-4" : "w-3.5 h-3.5"} />
        <span>{CURRENCY_LABELS[currency].symbol} {currency}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div
          className={cn(
            "absolute z-50 w-48 bg-white rounded-xl shadow-elevated border border-slate-100 py-2",
            variant === "header" ? "right-0 top-full mt-2" : "right-0 bottom-full mb-2"
          )}
          role="listbox"
        >
          {ORDER.map((code) => {
            const meta = CURRENCY_LABELS[code];
            const isActive = currency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setCurrency(code);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-between",
                  isActive ? "text-primary bg-primary/5" : "text-slate-700"
                )}
                role="option"
                aria-selected={isActive}
              >
                <span>
                  <span className="font-mono mr-1.5">{meta.symbol}</span>
                  {meta.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">{code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
