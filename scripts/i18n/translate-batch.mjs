#!/usr/bin/env node
// Phase 1.3 — TR -> 8 locale batch translator via Anthropic Haiku 4.5.
// Real-time parallel (chunked 20 strings/call). Disk cache by sha256(tr+locale).
//
// Usage:
//   node scripts/i18n/translate-batch.mjs --locales en,de,fr,es,nl,zh,hi,ur
//   node scripts/i18n/translate-batch.mjs --locale en --ns page.balonlar
//   node scripts/i18n/translate-batch.mjs --dry

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";
import Anthropic from "@anthropic-ai/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, "..", "..");
const KEYMAP = path.join(__dirname, "key-map.json");
const OUT_DIR = path.join(__dirname, "translations");
const CACHE_DIR = path.join(__dirname, "cache");

const ALL_LOCALES = ["en", "de", "fr", "es", "nl", "zh", "hi", "ur"];
const MODEL = "claude-haiku-4-5-20251001";
const CHUNK_SIZE = 20;
const CONCURRENCY = 6;

const LOCALE_NAMES = {
  en: "English (UK)",
  de: "German (Deutsch)",
  fr: "French (Français)",
  es: "Spanish (Español)",
  nl: "Dutch (Nederlands)",
  zh: "Simplified Chinese (简体中文)",
  hi: "Hindi (हिन्दी)",
  ur: "Urdu (اردو) — RTL",
};

const SYSTEM_PROMPT = `You translate Turkish tourism copy for TripAndTick.com, a Cappadocia (Türkiye) travel marketplace selling hot-air balloon tours, hotel bookings, ATV/horse tours, and transfers.

Translation rules:
1. Output JSON ONLY: an array of strings matching the input array order. No prose, no markdown fences.
2. Preserve placeholders verbatim: {count}, {price}, %s, %d, <Link>, <strong>, {{var}}.
3. Preserve numbers, currency symbols (€, $, ₺), percent signs, units, and proper nouns (TripAndTick, TÜRSAB, Trip and Tick, Stripe, Cappadocia, Nevşehir).
4. Brand voice: professional, warm, trustworthy, traveler-friendly. Match Booking.com / Viator tone.
5. Glossary (use locale-appropriate form):
   - Kapadokya → Cappadocia (EN) · Cappadoce (FR) · Kappadokien (DE) · Cappadocië (NL) · Capadocia (ES) · 卡帕多奇亚 (ZH) · कप्पडोकिया (HI) · کیپاڈوکیا (UR)
   - Nevşehir → Nevşehir (keep, optionally localize)
   - Balon turu / hot-air balloon tour: use natural travel-industry phrase in target language
   - TÜRSAB → keep "TÜRSAB"; expand only if user-facing context is unclear
   - "İade garantisi" → refund guarantee equivalent
   - "Lisanslı operatör" → licensed operator
6. Keep length similar (±20%) — UI may break with very long strings.
7. Do NOT add commentary, footnotes, or [translator notes].
8. Maintain capitalization style (Title Case stays Title Case; sentence case stays sentence case).
9. For Urdu: write natural RTL script.`;

function loadEnv() {
  const envFile = path.join(REPO, ".env.local");
  if (!fs.existsSync(envFile)) return;
  const lines = fs.readFileSync(envFile, "utf-8").split(/\r?\n/);
  for (const l of lines) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

function parseArgs(argv) {
  const out = { locales: ALL_LOCALES, ns: null, dry: false, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--locale" || a === "--locales") {
      const v = argv[++i];
      out.locales = v.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (a.startsWith("--locale=") || a.startsWith("--locales=")) {
      out.locales = a.split("=")[1].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (a === "--ns") {
      out.ns = argv[++i];
    } else if (a.startsWith("--ns=")) {
      out.ns = a.slice(5);
    } else if (a === "--dry") out.dry = true;
    else if (a === "--force") out.force = true;
  }
  return out;
}

function sha(s) {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 24);
}

function cacheGet(tr, locale) {
  const key = sha(`${locale}::${tr}`);
  const f = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(f)) return null;
  try {
    return JSON.parse(fs.readFileSync(f, "utf-8")).translation;
  } catch {
    return null;
  }
}

function cacheSet(tr, locale, translation) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const key = sha(`${locale}::${tr}`);
  const f = path.join(CACHE_DIR, `${key}.json`);
  fs.writeFileSync(
    f,
    JSON.stringify({ tr, locale, translation, ts: new Date().toISOString() })
  );
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function translateChunk(client, locale, items, retries = 2) {
  const userMsg = `Target language: ${LOCALE_NAMES[locale]}

Translate the following ${items.length} Turkish strings to ${LOCALE_NAMES[locale]}. Return a JSON array of strings, same order, no other text.

Source (Turkish):
${JSON.stringify(items.map((it) => it.tr))}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      });
      const text = resp.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("")
        .trim();
      const cleaned = text
        .replace(/^```(?:json)?\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
      const arr = JSON.parse(cleaned);
      if (!Array.isArray(arr)) throw new Error("not array");
      if (arr.length !== items.length)
        throw new Error(`length mismatch: ${arr.length} vs ${items.length}`);
      return arr;
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = 1000 * (attempt + 1);
      console.error(`  retry chunk (attempt ${attempt + 1}): ${err.message}, wait ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv);

  if (!fs.existsSync(KEYMAP)) {
    console.error(`Missing ${KEYMAP}. Run propose-keys.mjs first.`);
    process.exit(2);
  }
  if (!process.env.ANTHROPIC_API_KEY && !args.dry) {
    console.error("ANTHROPIC_API_KEY not set (checked .env.local + env).");
    process.exit(2);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const keyMap = JSON.parse(fs.readFileSync(KEYMAP, "utf-8"));
  const namespaces = args.ns ? [args.ns] : Object.keys(keyMap);

  const items = [];
  for (const ns of namespaces) {
    if (!keyMap[ns]) {
      console.warn(`skip ns (missing): ${ns}`);
      continue;
    }
    for (const [key, val] of Object.entries(keyMap[ns])) {
      items.push({ ns, key, tr: val.tr });
    }
  }
  console.log(`Items: ${items.length}, locales: ${args.locales.join(",")}, model: ${MODEL}`);

  const client = args.dry ? null : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const limit = pLimit(CONCURRENCY);

  const results = {};
  for (const loc of args.locales) results[loc] = {};

  let totalCacheHit = 0;
  let totalApiCall = 0;

  for (const loc of args.locales) {
    const toFetch = [];
    for (const it of items) {
      if (!args.force) {
        const cached = cacheGet(it.tr, loc);
        if (cached) {
          if (!results[loc][it.ns]) results[loc][it.ns] = {};
          results[loc][it.ns][it.key] = cached;
          totalCacheHit++;
          continue;
        }
      }
      toFetch.push(it);
    }
    console.log(`[${loc}] cache hits: ${items.length - toFetch.length}, to fetch: ${toFetch.length}`);
    if (toFetch.length === 0) continue;
    if (args.dry) {
      console.log(`[${loc}] DRY: would fetch ${toFetch.length}`);
      continue;
    }

    const chunks = chunk(toFetch, CHUNK_SIZE);
    const tasks = chunks.map((c) =>
      limit(async () => {
        const translations = await translateChunk(client, loc, c);
        for (let i = 0; i < c.length; i++) {
          const it = c[i];
          const tr = translations[i];
          if (!results[loc][it.ns]) results[loc][it.ns] = {};
          results[loc][it.ns][it.key] = tr;
          cacheSet(it.tr, loc, tr);
          totalApiCall++;
        }
      })
    );
    await Promise.all(tasks);
    console.log(
      `[${loc}] done, total keys: ${Object.values(results[loc]).reduce((a, b) => a + Object.keys(b).length, 0)}`
    );
  }

  for (const loc of args.locales) {
    const sorted = {};
    for (const ns of Object.keys(results[loc]).sort()) {
      sorted[ns] = {};
      for (const k of Object.keys(results[loc][ns]).sort()) {
        sorted[ns][k] = results[loc][ns][k];
      }
    }
    const outFile = path.join(OUT_DIR, `${loc}.json`);
    fs.writeFileSync(outFile, JSON.stringify(sorted, null, 2), "utf-8");
    console.log(`wrote ${path.relative(process.cwd(), outFile)}`);
  }

  console.log(`\nCache hits: ${totalCacheHit}, API calls (string-level): ${totalApiCall}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
