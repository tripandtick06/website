// E-posta tikfoutu ipucu: bilinen bir domaine 1 harf (uzun domainde 2) yakınsa düzeltilmiş adresi ÖNERİR.
// Hiçbir zaman değeri kendisi değiştirmez; yalnız öneri döner. Mantık keukeninbeeld intake.js ile aynı.
// Importers: src/components/ui/EmailHint.tsx

export const MAIL_DOMAINS = [
  "gmail.com", "hotmail.com", "hotmail.nl", "outlook.com", "outlook.nl", "live.nl", "live.com",
  "icloud.com", "me.com", "yahoo.com", "ziggo.nl", "kpnmail.nl", "kpnplanet.nl", "planet.nl", "home.nl", "xs4all.nl",
  "telfort.nl", "upcmail.nl", "casema.nl", "chello.nl", "msn.com", "protonmail.com", "proton.me",
] as const;

function distance(a: string, b: string): number {
  let prev: number[] = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/** Düzeltilmiş adres ya da "" (öneri yok). */
export function emailSuggestion(address: string): string {
  const m = /^([^@\s]+)@([^@\s]+)$/.exec(String(address || "").trim().toLowerCase());
  if (!m) return "";
  const domain = m[2].replace(/\.+$/, "");
  if ((MAIL_DOMAINS as readonly string[]).includes(domain)) return "";
  // Kısa domain: en fazla 1 harf fark, yoksa live.be yanlışlıkla live.nl olur.
  let best = "";
  let min = domain.length >= 9 ? 3 : 2;
  for (const known of MAIL_DOMAINS) {
    const d = distance(domain, known);
    if (d < min) {
      min = d;
      best = known;
    }
  }
  if (!best) {
    const tld = domain.replace(/\.(con|cmo|ocm|vom|xom|co|om)$/, ".com").replace(/\.(nll|nk|bl|ml)$/, ".nl");
    if (tld !== domain) best = tld;
  }
  return best ? `${m[1]}@${best}` : "";
}

const HINT: Record<string, [string, string]> = {
  en: ["Did you mean ", "?"],
  nl: ["Bedoelt u ", "?"],
  tr: ["Bunu mu demek istediniz: ", "?"],
};

/** [önek, sonek] — düğme ikisinin arasına girer. Bilinmeyen dil → en. */
export function emailHintText(locale: string): [string, string] {
  return HINT[locale] ?? HINT.en;
}
