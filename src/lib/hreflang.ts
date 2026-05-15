// Hreflang helpers — TR default, EN coming. Future-proof Next.js metadata alternates.

import { SITE_URL } from "@/lib/schema";

/**
 * Build hreflang `alternates.languages` map for a given path.
 *
 * Faz 1: yalniz TR URL'leri canli. EN slot'lari placeholder olarak ayni TR URL'e dönüyor
 * ki Google "no return tag" hatası vermesin; EN icerik live olunca burayi tek noktadan
 * /en/* prefix'e cevirecegiz.
 *
 * Usage:
 *   alternates: {
 *     canonical: `${SITE_URL}/balonlar`,
 *     languages: generateHreflang("/balonlar"),
 *   }
 */
export function generateHreflang(
  path: string
): Record<string, string> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const trUrl = `${SITE_URL}${normalized}`;
  // EN placeholder — same URL until /en/* prefix is live.
  const enUrl = trUrl;

  return {
    "tr-TR": trUrl,
    en: enUrl,
    "x-default": trUrl,
  };
}

/**
 * Build dynamic OG image URL for `/api/og` endpoint.
 */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `/api/og?${params.toString()}`;
}
