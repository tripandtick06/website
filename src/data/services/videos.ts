// Hizmet videolari — Higgsfield (Kling 3.0 pro, 1080p) ile sitenin mevcut hizmet
// fotograflarindan image-to-video; muzik vidIQ (royalty-free), ffmpeg ile mux.
// Aile bazli: sunrise/sunset/deluxe varyantlari ailenin klibini paylasir (60 slug
// icin 60 klip yerine 27). Oteller bilerek YOK: gercek otele ait olmayan AI video
// yaniltici olur. Dosyalar: public/videos/<key>.mp4 + poster public/images/video-posters/<key>.jpg
// Guard: tests/lib/service-videos.test.ts (dosya var, <20 MiB, her slug cozulur).

export interface ServiceVideo {
  src: string;
  poster: string;
}

export const HERO_VIDEO = {
  landscape: "/videos/hero-landscape.mp4",
  portrait: "/videos/hero-portrait.mp4",
  poster: "/images/hero/homepage.jpg",
} as const;

/** slug -> video aile anahtari. Ailede olmayan slug (otel) -> video yok. */
export const VIDEO_FAMILY: Record<string, string> = {
  // aktiviteler
  "atv-standart": "atv",
  "atv-sunrise": "atv",
  "atv-sunset": "atv",
  "jeep-standart": "jeep",
  "jeep-sunrise": "jeep",
  "jeep-sunset": "jeep",
  "at-standart": "at",
  "at-sunrise": "at",
  "at-sunset": "at",
  "hamam-standart": "hamam",
  "hamam-deluxe": "hamam",
  "turk-gecesi-yemekli": "turk-gecesi",
  "turk-gecesi-yemeksiz": "turk-gecesi",
  "microlight-standart": "microlight",
  "microlight-deluxe": "microlight",
  "balon-flying-dress-cekimi": "balon-flying-dress-cekimi",
  // turlar
  "kirmizi-tur": "kirmizi-tur",
  "yesil-tur": "yesil-tur",
  "mix-tur": "mix-tur",
  "sari-tur": "sari-tur",
  "yeralti-turu": "yeralti-turu",
  "gun-batimi-turu": "gun-batimi-turu",
  "instagram-turu": "instagram-turu",
  // balonlar
  "standart-balon-ucusu": "standart-balon-ucusu",
  "deluxe-balon-ucusu": "deluxe-balon-ucusu",
  "romantik-ozel-balon": "romantik-ozel-balon",
  // paketler
  "tam-gun-paket": "tam-gun-paket",
  "balayi-paketi": "balayi-paketi",
  "macera-paketi": "macera-paketi",
  "aile-paketi": "aile-paketi",
  "evlilik-teklifi": "evlilik-teklifi",
  "kurumsal-paket": "kurumsal-paket",
  // transferler
  "nev-otel": "nev-otel",
  "kayseri-otel": "kayseri-otel",
  "minibus-grup": "minibus-grup",
  "vip-arac": "vip-arac",
};

export const VIDEO_KEYS: string[] = Array.from(new Set(Object.values(VIDEO_FAMILY)));

export function videoForKey(key: string): ServiceVideo {
  return { src: `/videos/${key}.mp4`, poster: `/images/video-posters/${key}.jpg` };
}

export function getServiceVideo(slug: string): ServiceVideo | null {
  const key = VIDEO_FAMILY[slug];
  return key ? videoForKey(key) : null;
}
