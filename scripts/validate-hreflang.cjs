#!/usr/bin/env node
/**
 * Hreflang validator — fetches sitemap.xml, parses URL set + alternates,
 * verifies 9-locale parity and reciprocal links per Google guidelines:
 *   https://developers.google.com/search/docs/specialty/international/localized-versions
 *
 * Usage:
 *   node scripts/validate-hreflang.cjs                 # uses NEXT_PUBLIC_SITE_URL
 *   SITE=https://staging.tripandtick.com node ...      # override
 *
 * Exit codes:
 *   0 OK
 *   1 missing locale / non-reciprocal / wrong tag
 *   2 fetch/parse error
 */

"use strict";

// 17 locale (src/lib/hreflang.ts HREFLANG_LOCALES ile senkron) + x-default.
const EXPECTED_LOCALES = [
  "tr-TR", "en", "de", "fr", "es", "nl", "zh-Hans", "hi", "ur",
  "pt-PT", "pt-BR", "ja", "ko", "it", "ru", "uk", "az", "x-default",
];

const SITE =
  process.env.SITE ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://tripandtick.com";

const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose") || args.includes("-v");

function log(level, ...m) {
  const prefix = { ok: "OK", warn: "WARN", err: "ERR", info: "..." }[level] || "?";
  console.log(`[${prefix}]`, ...m);
}

async function fetchSitemap(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return await res.text();
}

function parseSitemapXml(xml) {
  const urls = new Map();
  const urlBlocks = xml.match(/<url\b[\s\S]*?<\/url>/g) || [];
  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) continue;
    const canonical = locMatch[1].trim();
    const alternates = new Map();
    const altRe = /<xhtml:link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/g;
    let m;
    while ((m = altRe.exec(block)) !== null) alternates.set(m[1], m[2]);
    urls.set(canonical, { alternates });
  }
  return urls;
}

function pathOf(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function stripLocale(pathname) {
  // pt-BR, pt'den ONCE (regex alternation sirasi onemli).
  return pathname.replace(/^\/(tr|en|de|fr|es|nl|zh|hi|ur|pt-BR|pt|ja|ko|it|ru|uk|az)(\/|$)/, "/");
}

function validate(urls) {
  const problems = [];
  const altSetIndex = new Map();

  for (const [canonical, { alternates }] of urls) {
    const canonPath = stripLocale(pathOf(canonical));
    const tags = [...alternates.keys()];

    for (const exp of EXPECTED_LOCALES) {
      if (!alternates.has(exp)) {
        problems.push(`${canonical} :: missing hreflang ${exp}`);
      }
    }

    const extras = tags.filter((t) => !EXPECTED_LOCALES.includes(t));
    for (const x of extras) problems.push(`${canonical} :: unexpected hreflang ${x}`);

    const groupKey = canonPath;
    if (!altSetIndex.has(groupKey)) altSetIndex.set(groupKey, []);
    altSetIndex.get(groupKey).push({ canonical, alternates });
  }

  for (const [path, members] of altSetIndex) {
    if (members.length < 2) continue;
    const reference = members[0].alternates;
    for (const m of members.slice(1)) {
      for (const [tag, href] of reference) {
        if (m.alternates.get(tag) !== href) {
          problems.push(
            `non-reciprocal alternates @ ${path} :: ${m.canonical} hreflang ${tag} -> ${m.alternates.get(tag) || "MISSING"} (expected ${href})`
          );
        }
      }
    }
  }

  return problems;
}

(async () => {
  let xml;
  try {
    log("info", `Fetching ${SITE}/sitemap.xml`);
    xml = await fetchSitemap(`${SITE}/sitemap.xml`);
  } catch (e) {
    log("err", `Fetch failed: ${e.message}`);
    process.exit(2);
  }

  const urls = parseSitemapXml(xml);
  log("info", `Parsed ${urls.size} <url> entries`);
  if (VERBOSE) {
    for (const [u, { alternates }] of urls) log("info", `  ${u} (${alternates.size} alternates)`);
  }

  const problems = validate(urls);
  if (problems.length === 0) {
    log("ok", `All ${urls.size} URLs have complete 17-locale + x-default hreflang and reciprocal links.`);
    process.exit(0);
  }

  log("warn", `${problems.length} hreflang problems found:`);
  for (const p of problems.slice(0, 50)) log("err", p);
  if (problems.length > 50) log("warn", `... ${problems.length - 50} more (suppress: use --verbose)`);
  process.exit(1);
})();
