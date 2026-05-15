import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trip and Tick — Kapadokya Balon Turu & Seyahat Acentası",
    short_name: "TripAndTick",
    description:
      "Kapadokya balon turu, otel, transfer ve aktiviteler. En düşük fiyat garantisi.",
    start_url: "/",
    display: "standalone",
    background_color: "#1A2B6B",
    theme_color: "#FF6B35",
    orientation: "portrait-primary",
    lang: "tr",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["travel", "tourism", "lifestyle"],
  };
}
