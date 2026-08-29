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
// heissluftballon-preise TR ciftleri consolidate edildi).
const BLOG_SLUG_REDIRECTS = [
  { from: "best-time-cappadocia-balloon-tr", to: "kapadokya-ne-zaman-gidilir" },
  { from: "heissluftballon-kappadokien-preise-buchung-tr", to: "kapadokya-balon-turu-fiyat-2026" },
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
    return redirects;
  },
};

module.exports = withNextIntl(nextConfig);
