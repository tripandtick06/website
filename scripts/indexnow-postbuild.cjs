#!/usr/bin/env node
/**
 * IndexNow postbuild — Bing + Yandex hizli indeksleme.
 *
 * Env:
 *   INDEXNOW_KEY = 32+ char random anahtar (public/<KEY>.txt dosyasinda da olmali)
 *   NEXT_PUBLIC_SITE_URL = canli site adresi (https://www.tripandtick.com)
 *
 * Yerel build'lerde veya KEY yoksa sessizce skip eder.
 */

const https = require("https");

const KEY = process.env.INDEXNOW_KEY;
const HOST = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripandtick.com";
const HOSTNAME = HOST.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

if (!KEY) {
  console.log("[IndexNow] INDEXNOW_KEY tanimli degil — skip.");
  process.exit(0);
}

if (HOSTNAME === "localhost" || HOSTNAME.startsWith("localhost:")) {
  console.log("[IndexNow] localhost build — skip.");
  process.exit(0);
}

const STATIC_URLS = [
  "/",
  "/balonlar",
  "/oteller",
  "/aktiviteler",
  "/turlar",
  "/paketler",
  "/transferler",
  "/kapadokya",
  "/blog",
  "/sss",
  "/hakkimizda",
  "/iletisim",
  "/gizlilik-politikasi",
  "/kullanim-sartlari",
  "/iptal-iade-politikasi",
  "/cerez-politikasi",
  "/kvkk",
];

const BALLOON_SLUGS = ["standart-balon-ucusu", "deluxe-balon-ucusu", "romantik-ozel-balon"];
BALLOON_SLUGS.forEach((s) => STATIC_URLS.push(`/balonlar/${s}`));

const urls = STATIC_URLS.map((u) => `${HOST}${u}`);

const payload = JSON.stringify({
  host: HOSTNAME,
  key: KEY,
  keyLocation: `${HOST}/${KEY}.txt`,
  urlList: urls,
});

const req = https.request(
  {
    hostname: "api.indexnow.org",
    path: "/IndexNow",
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload),
    },
  },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      console.log(`[IndexNow] ${urls.length} URL gonderildi -> ${res.statusCode}`);
      if (data) console.log(data);
    });
  }
);

req.on("error", (err) => {
  console.error("[IndexNow] hata:", err.message);
  process.exit(0);
});

req.write(payload);
req.end();
