// NOT: sadece server component / generateMetadata'da kullan (fs erisimi).
import { DICTIONARIES, type Dictionary, type Locale } from "./dictionaries";

// Server-side sozluk. Yeni diller (Worker-disi public/i18n) icin gercek ceviriyi
// BUILD-TIME fs ile okur (SSG metadata + RSC body -> statik HTML'e cevrili gomulur).
// Edge runtime'da fs yoksa EN-alias DICTIONARIES'e duser (crash yok).
// eval("require"): bundler node:fs'i STATIK bundle'a sokmaz (Worker temiz kalir).

const PUBLIC_DICT = new Set<Locale>([
  "pt", "pt-BR", "ja", "ko", "it", "ru", "uk", "az",
]);
const cache: Partial<Record<Locale, Dictionary>> = {};

export function serverDict(locale: Locale): Dictionary {
  if (!PUBLIC_DICT.has(locale)) return DICTIONARIES[locale] as Dictionary;
  if (cache[locale]) return cache[locale] as Dictionary;
  try {
    // Node 22: process.getBuiltinModule — bundler'a takilmaz, edge'de yoksa fallback.
    const getMod = (process as unknown as {
      getBuiltinModule?: (id: string) => unknown;
    }).getBuiltinModule;
    if (!getMod) return DICTIONARIES[locale] as Dictionary;
    const fs = getMod("node:fs") as typeof import("node:fs");
    const path = getMod("node:path") as typeof import("node:path");
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public", "i18n", `dict.${locale}.json`),
      "utf8"
    );
    const d = JSON.parse(raw) as Dictionary;
    cache[locale] = d;
    return d;
  } catch {
    return DICTIONARIES[locale] as Dictionary;
  }
}
