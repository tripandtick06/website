// Lead atifi — formlardan gelen kaynak bilgisi (tracker'in zaten hesapladigi degerler).
//
// Importers (callers):
//   - src/app/api/contact/route.ts, src/app/api/hotel-inquiry/route.ts, src/app/api/booking/route.ts
// Istemci tarafi: src/lib/analytics/tracker.ts `leadAttribution()`.
// Tum alanlar opsiyonel kisa string; gecersiz/uzun deger SESSIZCE dusulur (atif yuzunden
// lead asla 400 almaz). Cikti leads.payload JSON'una gider — migration yok.

import { z } from "zod";

const short = (max: number) => z.string().max(max).optional().catch(undefined);

export const attributionShape = {
  sid: short(40),
  utm_source: short(100),
  utm_medium: short(100),
  utm_campaign: short(100),
  gclid: short(100),
  fbclid: short(100),
  ref_host: short(200),
  form: short(60),
};

export type LeadAttribution = { [K in keyof typeof attributionShape]?: string };

/** Sadece dolu atif alanlarini dondurur (payload'a bos anahtar yazma). */
export function pickAttribution(d: LeadAttribution): LeadAttribution {
  const out: LeadAttribution = {};
  for (const k of Object.keys(attributionShape) as (keyof LeadAttribution)[]) {
    const v = d[k];
    if (v) out[k] = v;
  }
  return out;
}
