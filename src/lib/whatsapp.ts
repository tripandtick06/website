// WhatsApp click-to-chat yardimcilari (FAB + /api/whatsapp-click ortak).
//
// Importers (callers):
//   - src/components/booking/WhatsAppFAB.tsx    (href + tiklama beacon'i)
//   - src/app/api/whatsapp-click/route.ts       (Telegram bildirimi, sayfa URL'si)
//   - tests/lib/whatsapp.test.ts
//
// Neden var: wa.me linki musteriyi DOGRUDAN Murat'in telefonuna goturur; site sunucusu
// bu konusmayi hic gormez, Telegram'a hicbir sey dusmez (2026-09-14 vakasi: Brezilyali
// musteri 00:38'de FAB prefill'iyle yazdi, Telegram sessiz kaldi). Bu modul iki seyi
// duzeltir: (1) prefill musterinin dilinde + sayfa URL'si (Murat baglami gorur),
// (2) tiklama ani sunucuya bildirilir → Telegram'a "WhatsApp'a yonlendirildi" duser.

export const WHATSAPP_NUMBER_E164 = "905374647861";
export const WHATSAPP_NUMBER_DISPLAY = "+90 537 464 78 61";

const SITE_ORIGIN = "https://tripandtick.com";
const MAX_PATH_LEN = 300;

// Locale → selamlama. Eksik/bilinmeyen locale → EN (Murat'in musterileri agirlikla yabanci).
const PREFILL: Record<string, string> = {
  tr: "Merhaba, Trip and Tick hakkında bilgi almak istiyorum.",
  en: "Hello, I'd like to get information about Trip and Tick.",
  de: "Hallo, ich möchte Informationen über Trip and Tick erhalten.",
  fr: "Bonjour, je souhaite obtenir des informations sur Trip and Tick.",
  es: "Hola, me gustaría recibir información sobre Trip and Tick.",
  nl: "Hallo, ik wil graag informatie over Trip and Tick.",
  pt: "Olá, gostaria de receber informações sobre a Trip and Tick.",
  it: "Ciao, vorrei ricevere informazioni su Trip and Tick.",
  ru: "Здравствуйте, я хотел(а) бы получить информацию о Trip and Tick.",
  uk: "Доброго дня, я хотів(ла) б отримати інформацію про Trip and Tick.",
  az: "Salam, Trip and Tick haqqında məlumat almaq istəyirəm.",
  zh: "您好，我想了解 Trip and Tick 的信息。",
  ja: "こんにちは、Trip and Tick について情報をいただきたいです。",
  ko: "안녕하세요, Trip and Tick에 대한 정보를 받고 싶습니다.",
  hi: "नमस्ते, मैं Trip and Tick के बारे में जानकारी चाहता/चाहती हूँ।",
  ur: "السلام علیکم، میں Trip and Tick کے بارے میں معلومات حاصل کرنا چاہتا/چاہتی ہوں۔",
};

export function whatsappPrefill(locale: string | undefined): string {
  const key = (locale ?? "").trim();
  if (PREFILL[key]) return PREFILL[key];
  // "pt-BR" → "pt" gibi bolge kodlu locale'ler ana dile duser.
  const base = key.split("-")[0];
  return PREFILL[base] ?? PREFILL.en;
}

// Sadece site-ici, tek "/" ile baslayan, query/hash'siz path. Aksi halde "/" (anasayfa).
// Musteri girdisi degil ama client'tan gelir → Telegram mesajina/URL'ye gomulmeden once temizle.
export function sanitizeSitePath(path: string | undefined): string {
  if (!path || typeof path !== "string") return "/";
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return "/";
  const clean = path.split(/[?#]/)[0];
  if (!/^\/[A-Za-z0-9\-._~/%]*$/.test(clean)) return "/";
  return clean.length > MAX_PATH_LEN ? clean.slice(0, MAX_PATH_LEN) : clean;
}

export function sitePageUrl(path: string | undefined): string {
  return `${SITE_ORIGIN}${sanitizeSitePath(path)}`;
}

export function buildWhatsAppHref(locale: string | undefined, path: string | undefined): string {
  const text = `${whatsappPrefill(locale)}\n\n📍 ${sitePageUrl(path)}`;
  return `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
}
