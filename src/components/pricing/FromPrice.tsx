"use client";

// Baslangic fiyati etiketi — site net fiyat vermez, "X'dan baslayan fiyatlarla" der
// (2026-09-18 karar: tum aktivite/tur/balon/transfer). Sablon uiText.serviceCard.fromPrice
// ("{price}" yer tutucu, dil basina kelime sirasi degisir: TR sonek, EN/DE onek).
// Buyuk rakam LivePrice'tan gelir (admin taban fiyat override'i korunur).

import { LivePrice } from "@/components/pricing/LivePrice";
import { formatPrice } from "@/lib/utils";
import { useUiText } from "@/lib/i18n/uiText";

export interface FromPriceProps {
  slug: string;
  /** Katalog baslangic fiyati (SSR fallback). */
  price: number;
  currency?: string;
  /** Rakam boyutu — kart: "text-2xl", detay: "text-3xl". */
  priceClassName?: string;
  /** Sablon metni boyutu. */
  labelClassName?: string;
}

export function FromPrice({
  slug,
  price,
  currency = "EUR",
  priceClassName = "text-2xl",
  labelClassName = "text-xs",
}: FromPriceProps) {
  const ui = useUiText();
  const template = ui.serviceCard.fromPrice;
  const at = template.indexOf("{price}");
  const prefix = at >= 0 ? template.slice(0, at) : "";
  const suffix = at >= 0 ? template.slice(at + "{price}".length) : template;

  // Bosluklar sablondan gelir (TR "'dan" sonek bosluksuz, EN "from " boslukla) —
  // whitespace-pre-wrap korur, flex gap eklemez.
  return (
    <span className="inline whitespace-pre-wrap">
      {prefix && <span className={`${labelClassName} font-medium text-slate-500`}>{prefix}</span>}
      <span className={`${priceClassName} font-extrabold text-primary leading-none`}>
        <LivePrice slug={slug} fallback={price} format={(n) => formatPrice(n, currency)} />
      </span>
      {suffix && <span className={`${labelClassName} font-medium text-slate-500`}>{suffix}</span>}
    </span>
  );
}
