#!/usr/bin/env node
// Phase 1.5 — apply codemod: replace hardcoded TR with t("key") + inject imports.
// Uses extracted/<slug>.json offsets + key-map.json namespace/key lookup.
//
// Scope (pilot):
//   - JSX text nodes -> {t("key")}
//   - JSX attribute string -> name={t("key")}
//   - JSX attribute expression {"text"} -> name={t("key")}
//   - SKIP metadata (Phase 6 separate)
//   - SKIP module-top consts (Phase 4/5)
//
// Imports + t() init:
//   - "use client" present -> useTranslations (client)
//   - default export Page (server) -> getTranslations + async wrap
//
// Usage:
//   node scripts/i18n/apply-codemod.mjs --page balonlar --dry
//   node scripts/i18n/apply-codemod.mjs --page balonlar
//   node scripts/i18n/apply-codemod.mjs --file src/components/sections/HeroSection.tsx

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, "..", "..");
const EXTRACTED_DIR = path.join(__dirname, "extracted");
const KEYMAP = path.join(__dirname, "key-map.json");

function parseArgs(argv) {
  const out = { dry: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--page") out.page = argv[++i];
    else if (a.startsWith("--page=")) out.page = a.slice(7);
    else if (a === "--file") out.file = argv[++i];
    else if (a.startsWith("--file=")) out.file = a.slice(7);
    else if (a === "--slug") out.slug = argv[++i];
    else if (a.startsWith("--slug=")) out.slug = a.slice(7);
    else if (a === "--dry") out.dry = true;
  }
  return out;
}

function slugFromFile(filepath) {
  return path
    .relative(REPO, filepath)
    .replace(/\\/g, "/")
    .replace(/^src\//, "")
    .replace(/\//g, "__")
    .replace(/\.(tsx|ts|jsx|js)$/, "");
}

function resolveTarget(args) {
  if (args.file) return path.isAbsolute(args.file) ? args.file : path.join(REPO, args.file);
  if (args.page) return path.join(REPO, "src", "app", "[locale]", args.page, "page.tsx");
  if (args.slug) {
    const guess = args.slug.replace(/__/g, "/") + ".tsx";
    return path.join(REPO, "src", guess);
  }
  return null;
}

function pathToNamespace(filepath) {
  const p = filepath.replace(/\\/g, "/");
  if (p.startsWith("src/app/[locale]/")) {
    const rest = p
      .replace("src/app/[locale]/", "")
      .replace(/\/page\.tsx$/, "")
      .replace(/\.tsx$/, "");
    if (rest === "" || rest === "page") return "page.home";
    const segs = rest
      .split("/")
      .filter((s) => s && s !== "page")
      .map((s) => s.replace(/\[(.+?)\]/g, "$1"))
      .map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
    return ["page", ...segs].join(".");
  }
  if (p.startsWith("src/components/")) {
    const rest = p.replace("src/components/", "").replace(/\.tsx$/, "");
    const segs = rest.split("/").map((s, i, arr) => {
      if (i === arr.length - 1) {
        return s
          .replace(/([A-Z])/g, "_$1")
          .toLowerCase()
          .replace(/^_/, "")
          .replace(/_section$/, "")
          .replace(/_widget$/, "");
      }
      return s.toLowerCase();
    });
    return ["component", ...segs].join(".");
  }
  return p
    .replace(/^src\//, "")
    .replace(/\.tsx?$/, "")
    .replace(/[\\/]/g, ".")
    .replace(/\[(.+?)\]/g, "$1")
    .toLowerCase();
}

function detectClient(source) {
  return /^\s*["']use client["'];?\s*$/m.test(source.split("\n").slice(0, 5).join("\n"));
}

function isMetadataOffset(source, start, end) {
  const ctx = source.slice(Math.max(0, start - 200), end + 50);
  return (
    /\bmetadata\s*[:=]\s*{/.test(ctx) ||
    /openGraph\s*:\s*{/.test(ctx) ||
    /twitter\s*:\s*{/.test(ctx) ||
    /alternates\s*:\s*{/.test(ctx)
  );
}

function buildTKeyLookup(keyMap, namespace) {
  const lookup = new Map();
  if (!keyMap[namespace]) return lookup;
  for (const [key, val] of Object.entries(keyMap[namespace])) {
    lookup.set(val.tr, key);
  }
  return lookup;
}

function processFile(filepath, args) {
  if (!fs.existsSync(filepath)) {
    console.error(`Missing file: ${filepath}`);
    process.exit(2);
  }

  const slug = slugFromFile(filepath);
  const extractedFile = path.join(EXTRACTED_DIR, `${slug}.json`);
  if (!fs.existsSync(extractedFile)) {
    console.error(`Missing extracted file: ${path.relative(process.cwd(), extractedFile)}`);
    process.exit(2);
  }

  const extracted = JSON.parse(fs.readFileSync(extractedFile, "utf-8"));
  const keyMap = JSON.parse(fs.readFileSync(KEYMAP, "utf-8"));
  const ns = pathToNamespace(extracted.file);
  const lookup = buildTKeyLookup(keyMap, ns);

  if (lookup.size === 0) {
    console.error(`No keys for namespace ${ns}. Run propose-keys.mjs first.`);
    process.exit(2);
  }

  const src = fs.readFileSync(filepath, "utf-8");
  const isClient = detectClient(src);

  const replacements = [];
  let skippedMetadata = 0;
  let skippedNoKey = 0;
  let skippedUnsupported = 0;

  for (const str of extracted.strings) {
    if (str.type?.startsWith("metadata.")) {
      skippedMetadata++;
      continue;
    }
    const sStart = str.start ?? str.rawStart;
    const sEnd = str.end ?? str.rawEnd;
    if (isMetadataOffset(src, sStart, sEnd)) {
      skippedMetadata++;
      continue;
    }
    const tKey = lookup.get(str.tr);
    if (!tKey) {
      skippedNoKey++;
      continue;
    }
    if (str.type === "jsxText") {
      replacements.push({ start: str.textStart, end: str.textEnd, newText: `{t("${tKey}")}` });
    } else if (str.type?.startsWith("jsxAttr:")) {
      replacements.push({ start: str.start, end: str.end, newText: `{t("${tKey}")}` });
    } else if (str.type?.startsWith("jsxAttrExpr:")) {
      replacements.push({ start: str.start, end: str.end, newText: `t("${tKey}")` });
    } else {
      skippedUnsupported++;
    }
  }

  replacements.sort((a, b) => b.start - a.start);

  let modified = src;
  for (const r of replacements) {
    modified = modified.slice(0, r.start) + r.newText + modified.slice(r.end);
  }

  const importLine = isClient
    ? `import { useTranslations } from "next-intl";`
    : `import { getTranslations } from "next-intl/server";`;

  if (!modified.includes(importLine)) {
    const importRegex = /^(import\s[^;]+;\s*)+/m;
    const m = modified.match(importRegex);
    if (m) {
      const insertAt = m.index + m[0].length;
      modified = modified.slice(0, insertAt) + importLine + "\n" + modified.slice(insertAt);
    } else {
      modified = importLine + "\n" + modified;
    }
  }

  const fnRe = /export\s+default\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*{/;
  const fnMatch = modified.match(fnRe);
  if (!fnMatch) {
    console.warn(`Could not find export default function in ${filepath} — skipping t() init`);
  } else {
    const fnStart = fnMatch.index;
    const openBraceIdx = fnStart + fnMatch[0].length;
    const isAlreadyAsync = !!fnMatch[1];
    const fnName = fnMatch[2];
    const fnParams = fnMatch[3];

    const fnBodyHead = modified.slice(openBraceIdx, openBraceIdx + 200);
    if (!/const\s+t\s*=\s*(await\s+getTranslations|useTranslations)/.test(fnBodyHead)) {
      const tInit = isClient
        ? `\n  const t = useTranslations("${ns}");`
        : `\n  const t = await getTranslations("${ns}");`;
      modified = modified.slice(0, openBraceIdx) + tInit + modified.slice(openBraceIdx);
    }

    if (!isClient && !isAlreadyAsync) {
      const newDecl = `export default async function ${fnName}(${fnParams}) {`;
      modified = modified.slice(0, fnStart) + newDecl + modified.slice(fnStart + fnMatch[0].length);
    }
  }

  const outPath = args.dry ? filepath + ".codemod-preview.tsx" : filepath;
  fs.writeFileSync(outPath, modified, "utf-8");
  console.log(
    `${args.dry ? "DRY " : ""}wrote ${path.relative(process.cwd(), outPath)} ` +
      `(${replacements.length} replaced, ${skippedMetadata} metadata-skipped, ${skippedNoKey} no-key, ${skippedUnsupported} unsupported)`
  );
}

const args = parseArgs(process.argv);
const target = resolveTarget(args);
if (!target) {
  console.error("Usage: --page <slug> | --file <path>");
  process.exit(2);
}
processFile(target, args);
