#!/usr/bin/env node
/**
 * Google PageSpeed Insights audit (mobile + desktop)
 *
 * Usage:
 *   node scripts/psi-audit.cjs                              # default URL
 *   node scripts/psi-audit.cjs https://www.tripandtick.com/sss/ # custom URL
 *
 * Env:
 *   GOOGLE_PSI_KEY  PSI v5 API key (opsiyonel ama rate-limit icin onerilir)
 *
 * Output:
 *   - console: score ozeti her strategy icin
 *   - file:    scripts/logs/psi-{YYYY-MM-DD}-{strategy}.json
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const DEFAULT_URL = "https://www.tripandtick.com";
const TARGET_URL = process.argv[2] || DEFAULT_URL;
const API_KEY = process.env.GOOGLE_PSI_KEY || "";

const STRATEGIES = ["mobile", "desktop"];
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const LOG_DIR = path.join(__dirname, "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function todayStr() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildApiUrl(target, strategy) {
  const base = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const cats = CATEGORIES.map((c) => `category=${c}`).join("&");
  const key = API_KEY ? `&key=${encodeURIComponent(API_KEY)}` : "";
  return `${base}?url=${encodeURIComponent(target)}&strategy=${strategy}&${cats}${key}`;
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error("PSI response JSON parse error: " + e.message));
          }
        });
      })
      .on("error", reject);
  });
}

function scorePct(category) {
  if (!category || typeof category.score !== "number") return null;
  return Math.round(category.score * 100);
}

async function runStrategy(target, strategy) {
  const apiUrl = buildApiUrl(target, strategy);
  process.stdout.write(`\n[PSI] ${strategy.padEnd(7)} -> ${target}\n`);
  const data = await get(apiUrl);
  const cats = data.lighthouseResult && data.lighthouseResult.categories;
  const summary = {
    url: target,
    strategy,
    fetchedAt: new Date().toISOString(),
    scores: {
      performance: scorePct(cats && cats.performance),
      accessibility: scorePct(cats && cats.accessibility),
      bestPractices: scorePct(cats && cats["best-practices"]),
      seo: scorePct(cats && cats.seo),
    },
    crux: data.loadingExperience && data.loadingExperience.metrics
      ? Object.fromEntries(
          Object.entries(data.loadingExperience.metrics).map(([k, v]) => [
            k,
            { p75: v.percentile, category: v.category },
          ])
        )
      : null,
  };

  const file = path.join(LOG_DIR, `psi-${todayStr()}-${strategy}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ summary, lighthouseResult: data.lighthouseResult }, null, 2)
  );

  console.log("  scores:", summary.scores);
  if (summary.crux) console.log("  CrUX p75:", summary.crux);
  console.log("  saved:", path.relative(process.cwd(), file));
  return summary;
}

(async () => {
  if (!API_KEY) {
    console.warn("[PSI] WARNING: GOOGLE_PSI_KEY env yok — rate-limit dusuk.");
  }
  const results = [];
  for (const s of STRATEGIES) {
    try {
      results.push(await runStrategy(TARGET_URL, s));
    } catch (err) {
      console.error(`[PSI] ${s} FAILED:`, err.message);
    }
  }
  console.log("\n[PSI] done.");
  process.exit(results.length === STRATEGIES.length ? 0 : 1);
})();
