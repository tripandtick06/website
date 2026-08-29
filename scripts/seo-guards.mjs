#!/usr/bin/env node
// SEO regression guards — run manually via `npm run check:seo`.
// NOT wired into build/prebuild on purpose (see FIX 8 in SEO audit).
//
// Guard (a): a dynamic detail page under src/app/[locale]/**/[*]/page.tsx
//   that (1) opts into `runtime = "edge"` AND (2) enumerates its full param
//   set via `generateStaticParams` MUST also set `dynamicParams = false`
//   (without it, any param outside that enumerated set soft-404s: it 200s
//   through the edge function with notFound() UI instead of a real 404).
//   Scoped to files that HAVE generateStaticParams on purpose — token/code
//   landing pages (e.g. /davet/[code], /rezervasyon/yeniden-tarih/[token])
//   are intentionally fully-dynamic with no generateStaticParams, and must
//   NOT get dynamicParams=false or every valid runtime token 404s.
// Guard (b): no page-level metadata title string under src/app/[locale]
//   may hardcode "| Trip and Tick" — the root layout's title.template
//   ("%s | Trip and Tick") already appends it; a hardcoded suffix doubles it.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const LOCALE_APP_DIR = join(ROOT, "src", "app", "[locale]");

/** Recursively collect file paths under `dir` matching `filter(path)`. */
function walk(dir, filter, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, filter, out);
    } else if (filter(full)) {
      out.push(full);
    }
  }
  return out;
}

function toPosix(p) {
  return p.split(sep).join("/");
}

const failures = [];

// --- Guard (a): edge runtime dynamic detail pages need dynamicParams=false ---
const pageFiles = walk(LOCALE_APP_DIR, (p) => p.endsWith(`${sep}page.tsx`));

for (const file of pageFiles) {
  const rel = toPosix(relative(ROOT, file));
  // Only dynamic detail pages: at least one more "[...]" segment nested
  // under src/app/[locale]/ besides [locale] itself, e.g. .../[slug]/page.tsx.
  const segments = rel.split("/");
  const localeIdx = segments.indexOf("[locale]");
  const hasNestedDynamicSegment = segments
    .slice(localeIdx + 1, -1) // between "[locale]" and "page.tsx"
    .some((seg) => seg.startsWith("[") && seg.endsWith("]"));
  if (!hasNestedDynamicSegment) continue;

  const content = readFileSync(file, "utf8");
  const hasEdgeRuntime = /runtime\s*=\s*["']edge["']/.test(content);
  if (!hasEdgeRuntime) continue;

  const hasGenerateStaticParams = /generateStaticParams/.test(content);
  if (!hasGenerateStaticParams) continue; // intentionally fully-dynamic (token/code) page

  const hasDynamicParamsFalse = /dynamicParams\s*=\s*false/.test(content);
  if (!hasDynamicParamsFalse) {
    failures.push(
      `[soft-404 risk] ${rel}: runtime="edge" + generateStaticParams without "export const dynamicParams = false;" — a param outside the enumerated set will 200 through the edge function instead of 404ing.`
    );
  }
}

// --- Guard (b): no hardcoded "| Trip and Tick" title suffix ---
const candidateFiles = walk(
  LOCALE_APP_DIR,
  (p) => (p.endsWith(".tsx") || p.endsWith(".ts")) && !p.endsWith(`${sep}layout.tsx`)
);

const SUFFIX = "| Trip and Tick";
for (const file of candidateFiles) {
  const rel = toPosix(relative(ROOT, file));
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.includes(SUFFIX) && /title/i.test(line)) {
      failures.push(
        `[doubled title] ${rel}:${idx + 1}: hardcodes "${SUFFIX}" — root layout's title.template ("%s | Trip and Tick") already appends this suffix.`
      );
    }
  });
}

if (failures.length > 0) {
  console.error(`seo-guards: ${failures.length} violation(s) found\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("seo-guards: OK — no soft-404 risk, no doubled titles.");
process.exit(0);
