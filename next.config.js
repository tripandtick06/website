const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Katalog revizyonu sonrasi silinen slug'lar — en yakin yeni slug'a 301 redirect.
const LEGACY_SLUG_REDIRECTS = [
  { from: "konfor-balon-ucusu", to: "standart-balon-ucusu" },
  { from: "atv-full", to: "atv-sunset" },
  { from: "jeep-yarim", to: "jeep-standart" },
  { from: "jeep-tam", to: "jeep-standart" },
  { from: "at-full", to: "at-standart" },
];

// Blog kannibalizasyon konsolidasyonu (2026-08-29) — silinen TR makale slug'lari
// en yakin canonical slug'a 301 redirect. Kaynak: SEO sprint (best-time +
// heissluftballon-preise TR ciftleri consolidate edildi). TR default locale
// prefixsiz oldugu icin bu redirect'ler SADECE TR'yi hedefler — from slug'lari
// "-tr" suffix'i tasidigindan diger 16 locale'in gercek slug'iyla hicbir zaman
// eslesmez (dogrulandi: hicbir non-TR dosyanin slug alani "-tr" ile bitmiyor).
const BLOG_SLUG_REDIRECTS = [
  { from: "best-time-cappadocia-balloon-tr", to: "kapadokya-ne-zaman-gidilir" },
  { from: "heissluftballon-kappadokien-preise-buchung-tr", to: "kapadokya-balon-turu-fiyat-2026" },
];

// best-time-cappadocia-balloon temizligi (2026-08-29) — 16 non-TR locale'de
// TR ile ayni kannibalizasyon vardi (loser makale + kapadokya-ne-zaman-gidilir
// hedefi ayni locale'de bir arada). Dosyalar silindi; her locale kendi gercek
// slug alanina gore (bkz. public/blog/*.json "slug" alani — dosya adi degil)
// redirect alir. "to" her locale'de FARKLI (kendi -locale suffix'i), bu yuzden
// generic BLOG_SLUG_REDIRECTS dongusu kullanilamaz — locale-explicit liste.
const BLOG_SLUG_REDIRECTS_PER_LOCALE = [
  { locale: "az", from: "best-time-cappadocia-balloon-az", to: "kapadokya-ne-zaman-gidilir-az" },
  { locale: "de", from: "best-time-cappadocia-balloon-de", to: "kapadokya-ne-zaman-gidilir-de" },
  // en: loser slug istisnasi — diger locale'lerin aksine "-en" suffix'i YOK.
  { locale: "en", from: "best-time-cappadocia-balloon", to: "kapadokya-ne-zaman-gidilir-en" },
  { locale: "es", from: "best-time-cappadocia-balloon-es", to: "kapadokya-ne-zaman-gidilir-es" },
  { locale: "fr", from: "best-time-cappadocia-balloon-fr", to: "kapadokya-ne-zaman-gidilir-fr" },
  { locale: "hi", from: "best-time-cappadocia-balloon-hi", to: "kapadokya-ne-zaman-gidilir-hi" },
  { locale: "it", from: "best-time-cappadocia-balloon-it", to: "kapadokya-ne-zaman-gidilir-it" },
  { locale: "ja", from: "best-time-cappadocia-balloon-ja", to: "kapadokya-ne-zaman-gidilir-ja" },
  { locale: "ko", from: "best-time-cappadocia-balloon-ko", to: "kapadokya-ne-zaman-gidilir-ko" },
  { locale: "nl", from: "best-time-cappadocia-balloon-nl", to: "kapadokya-ne-zaman-gidilir-nl" },
  { locale: "pt", from: "best-time-cappadocia-balloon-pt", to: "kapadokya-ne-zaman-gidilir-pt" },
  { locale: "pt-BR", from: "best-time-cappadocia-balloon-pt-BR", to: "kapadokya-ne-zaman-gidilir-pt-BR" },
  { locale: "ru", from: "best-time-cappadocia-balloon-ru", to: "kapadokya-ne-zaman-gidilir-ru" },
  { locale: "uk", from: "best-time-cappadocia-balloon-uk", to: "kapadokya-ne-zaman-gidilir-uk" },
  { locale: "ur", from: "best-time-cappadocia-balloon-ur", to: "kapadokya-ne-zaman-gidilir-ur" },
  { locale: "zh", from: "best-time-cappadocia-balloon-zh", to: "kapadokya-ne-zaman-gidilir-zh" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
    ],
  },
  async redirects() {
    const redirects = [
      // www → apex (non-www) — tek canonical host; GSC "alternatif sayfa,
      // canonical farkli" hatasini onler.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tripandtick.com" }],
        destination: "https://tripandtick.com/:path*",
        permanent: true,
      },
    ];
    for (const { from, to } of LEGACY_SLUG_REDIRECTS) {
      if (from.includes("balon")) {
        redirects.push({ source: `/balonlar/${from}`, destination: `/balonlar/${to}`, permanent: true });
        redirects.push({ source: `/:locale/balonlar/${from}`, destination: `/:locale/balonlar/${to}`, permanent: true });
      }
      redirects.push({ source: `/rezervasyon/${from}`, destination: `/rezervasyon/${to}`, permanent: true });
      redirects.push({ source: `/:locale/rezervasyon/${from}`, destination: `/:locale/rezervasyon/${to}`, permanent: true });
    }
    for (const { from, to } of BLOG_SLUG_REDIRECTS) {
      redirects.push({ source: `/blog/${from}`, destination: `/blog/${to}`, permanent: true });
      redirects.push({ source: `/:locale/blog/${from}`, destination: `/:locale/blog/${to}`, permanent: true });
    }
    for (const { locale, from, to } of BLOG_SLUG_REDIRECTS_PER_LOCALE) {
      redirects.push({ source: `/${locale}/blog/${from}`, destination: `/${locale}/blog/${to}`, permanent: true });
    }
    return redirects;
  },
};

module.exports = withNextIntl(nextConfig);
