/**
 * IndexNow postbuild — Bing + Yandex hizli indeksleme.
 * TUM public yuzeyi ping'ler (statik + blog/balon/otel/operator detaylari) —
 * eski .cjs sadece ~18 statik URL gonderiyordu. URL seti src/lib/public-paths.ts.
 *
 * Env:
 *   INDEXNOW_KEY = public/<KEY>.txt ile ayni anahtar
 *   NEXT_PUBLIC_SITE_URL = https://tripandtick.com
 * Yerel build'lerde veya KEY yoksa sessizce skip.
 *
 * Calistir (otomatik): npm postbuild -> npx tsx scripts/indexnow-postbuild.ts
 */
import { allPublicPaths, toAbsolute } from "../src/lib/public-paths";

const KEY = process.env.INDEXNOW_KEY;
const HOST = process.env.NEXT_PUBLIC_SITE_URL || "https://tripandtick.com";
const HOSTNAME = HOST.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

async function main(): Promise<void> {
  if (!KEY) {
    console.log("[IndexNow] INDEXNOW_KEY tanimli degil — skip.");
    return;
  }
  if (HOSTNAME === "localhost" || HOSTNAME.startsWith("localhost:")) {
    console.log("[IndexNow] localhost build — skip.");
    return;
  }

  const urls = allPublicPaths().map((p) => toAbsolute(p, HOST));
  const payload = {
    host: HOSTNAME,
    key: KEY,
    keyLocation: `${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    console.log(`[IndexNow] ${urls.length} URL gonderildi -> ${res.status}`);
    const body = await res.text();
    if (body) console.log(body);
  } catch (err) {
    console.error("[IndexNow] hata:", (err as Error).message);
  }
}

main();
