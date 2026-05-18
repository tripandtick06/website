#!/usr/bin/env node
// Phase 1.1 — TR user-visible string extractor.
// AST: Babel parser + traverse. Output: scripts/i18n/extracted/<slug>.json
//
// Usage:
//   node scripts/i18n/extract-strings.mjs --page balonlar
//   node scripts/i18n/extract-strings.mjs --file src/app/[locale]/balonlar/page.tsx
//   node scripts/i18n/extract-strings.mjs --glob "src/app/[locale]/**/page.tsx"
//   node scripts/i18n/extract-strings.mjs --all

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";

const traverse = _traverse.default || _traverse;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(__dirname, "extracted");

const TRANSLATABLE_ATTRS = new Set([
  "alt",
  "title",
  "aria-label",
  "ariaLabel",
  "placeholder",
  "data-tooltip",
  "label",
  "description",
  "tag",
  "highlight",
  "name",
]);
const NON_TRANSLATABLE_ATTRS = new Set([
  "className",
  "href",
  "src",
  "id",
  "key",
  "ref",
  "htmlFor",
  "role",
  "type",
  "pattern",
  "autoComplete",
  "dir",
  "lang",
  "rel",
  "target",
  "method",
  "action",
  "encType",
  "style",
  "as",
  "size",
  "variant",
  "color",
  "value",
  "defaultValue",
  "min",
  "max",
  "step",
  "loading",
  "decoding",
  "fetchPriority",
  "crossOrigin",
  "referrerPolicy",
  "sizes",
  "srcSet",
  "data-track",
  "data-event",
  "data-testid",
  "data-key",
]);
const METADATA_TEXT_KEYS = new Set([
  "title",
  "description",
  "alt",
  "siteName",
]);

const TR_DIACRITICS = /[ğüşıöçĞÜŞİÖÇ]/;
const TR_COMMON_WORDS =
  /\b(ve|için|ile|bir|bu|şu|daha|az|çok|fiyat|tur|gün|saat|kişi|sepet|garanti|iade|rezervasyon|paket|otel|aktivite|hakkımızda|iletişim|sıkça|sorular|gizlilik|kullanım|şartları|politika|kapadokya|nevşehir|balon|sigorta|şampanya|sertifika|kahvaltı|transfer|deneyim|operatör|lisanslı|özel|romantik|standart|konfor|deluxe|aile|grup|çocuk|yetişkin|yolculuk|seyahat|şehir|ülke|hediye|kupon|indirim|şeffaf|hesap|abone|destek|merhaba|teşekkür|yükleniyor|gönder|tamam|iptal|kaydet|sil|düzenle|göster|gizle|seç|seçim|tarih|hafta)\b/i;

function isLikelyTurkish(s) {
  if (!s || typeof s !== "string") return false;
  const trimmed = s.trim();
  if (trimmed.length < 2) return false;
  if (/^[#@/$%]/.test(trimmed)) return false;
  if (/^https?:\/\//.test(trimmed)) return false;
  if (/^[A-Z0-9_]+$/.test(trimmed)) return false;
  if (/^[a-z]+(-[a-z]+)+$/.test(trimmed)) return false;
  if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed)) return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;
  if (/^[\s\W]+$/.test(trimmed)) return false;
  if (TR_DIACRITICS.test(trimmed)) return true;
  if (TR_COMMON_WORDS.test(trimmed)) return true;
  if (/\s/.test(trimmed) && /[A-Za-zğüşıöçĞÜŞİÖÇ]/.test(trimmed) && trimmed.length >= 4) {
    const letterRatio =
      (trimmed.match(/[A-Za-zğüşıöçĞÜŞİÖÇ\s]/g) || []).length / trimmed.length;
    if (letterRatio > 0.7) return true;
  }
  return false;
}

function parseFile(filepath) {
  const src = fs.readFileSync(filepath, "utf-8");
  const ast = parse(src, {
    sourceType: "module",
    plugins: ["jsx", "typescript", "topLevelAwait", "decorators-legacy", "classProperties"],
    errorRecovery: true,
  });
  return { src, ast };
}

function jsxAttrName(attr) {
  if (!attr.name) return null;
  if (attr.name.type === "JSXIdentifier") return attr.name.name;
  if (attr.name.type === "JSXNamespacedName")
    return `${attr.name.namespace.name}:${attr.name.name.name}`;
  return null;
}

function jsxOpeningName(node) {
  if (!node || !node.name) return null;
  const n = node.name;
  if (n.type === "JSXIdentifier") return n.name;
  if (n.type === "JSXMemberExpression") return `${n.object.name || "?"}.${n.property.name}`;
  return null;
}

function collectFromString(node, type, ctx, list) {
  let raw, start, end, line, col;
  if (node.type === "StringLiteral") {
    raw = node.value;
    start = node.start;
    end = node.end;
    line = node.loc?.start?.line;
    col = node.loc?.start?.column;
  } else if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    raw = node.quasis.map((q) => q.value.cooked).join("");
    start = node.start;
    end = node.end;
    line = node.loc?.start?.line;
    col = node.loc?.start?.column;
  } else {
    return;
  }
  if (!isLikelyTurkish(raw)) return;
  list.push({
    type,
    tr: raw,
    start,
    end,
    line,
    col,
    context: ctx,
    nodeType: node.type,
  });
}

function extract(filepath) {
  const { src, ast } = parseFile(filepath);
  const strings = [];
  const seenOffsets = new Set();

  traverse(ast, {
    JSXText(p) {
      const raw = p.node.value;
      const trimmed = raw.trim();
      if (!trimmed) return;
      if (!isLikelyTurkish(trimmed)) return;
      const offsetKey = `${p.node.start}-${p.node.end}`;
      if (seenOffsets.has(offsetKey)) return;
      seenOffsets.add(offsetKey);
      const leadingMatch = raw.match(/^\s*/)[0];
      const trailingMatch = raw.match(/\s*$/)[0];
      strings.push({
        type: "jsxText",
        tr: trimmed,
        rawStart: p.node.start,
        rawEnd: p.node.end,
        textStart: p.node.start + leadingMatch.length,
        textEnd: p.node.end - trailingMatch.length,
        line: p.node.loc?.start?.line,
        col: p.node.loc?.start?.column,
        context: jsxOpeningName(p.parent) || "jsx",
        nodeType: "JSXText",
        leading: leadingMatch,
        trailing: trailingMatch,
      });
    },

    JSXAttribute(p) {
      const name = jsxAttrName(p.node);
      if (!name) return;
      if (NON_TRANSLATABLE_ATTRS.has(name)) return;
      const accept =
        TRANSLATABLE_ATTRS.has(name) ||
        /label|text|hint|message|title|desc|tooltip|placeholder/i.test(name);
      const componentName = jsxOpeningName(p.parent);
      const ctx = `${componentName || "jsx"}@${name}`;
      const val = p.node.value;
      if (!val) return;
      if (val.type === "StringLiteral") {
        if (!accept) return;
        const key = `${val.start}-${val.end}`;
        if (seenOffsets.has(key)) return;
        seenOffsets.add(key);
        collectFromString(val, `jsxAttr:${name}`, ctx, strings);
      } else if (val.type === "JSXExpressionContainer") {
        if (!accept) return;
        const expr = val.expression;
        if (!expr) return;
        const key = `${expr.start}-${expr.end}`;
        if (seenOffsets.has(key)) return;
        seenOffsets.add(key);
        collectFromString(expr, `jsxAttrExpr:${name}`, ctx, strings);
      }
    },

    ObjectProperty(p) {
      const key = p.node.key;
      const keyName = key?.name || key?.value;
      if (!keyName || !METADATA_TEXT_KEYS.has(keyName)) return;
      let inMetadata = false;
      let parent = p.parentPath;
      while (parent) {
        if (
          parent.node?.type === "VariableDeclarator" &&
          parent.node.id?.name === "metadata"
        ) {
          inMetadata = true;
          break;
        }
        if (
          parent.node?.type === "ReturnStatement" &&
          parent.scope?.block?.id?.name === "generateMetadata"
        ) {
          inMetadata = true;
          break;
        }
        parent = parent.parentPath;
      }
      if (!inMetadata) return;
      const v = p.node.value;
      if (!v) return;
      const offsetKey = `${v.start}-${v.end}`;
      if (seenOffsets.has(offsetKey)) return;
      seenOffsets.add(offsetKey);
      collectFromString(v, `metadata.${keyName}`, `metadata`, strings);
    },
  });

  strings.sort((a, b) => (a.rawStart ?? a.start) - (b.rawStart ?? b.start));

  return {
    file: path.relative(REPO, filepath).replace(/\\/g, "/"),
    bytes: src.length,
    stringCount: strings.length,
    strings,
  };
}

function slugify(filepath) {
  return path
    .relative(REPO, filepath)
    .replace(/\\/g, "/")
    .replace(/^src\//, "")
    .replace(/\//g, "__")
    .replace(/\.(tsx|ts|jsx|js)$/, "");
}

function walkGlob(globPattern) {
  const parts = globPattern.replace(/\\/g, "/").split("/");
  function recurse(dir, idx) {
    if (idx >= parts.length) return [];
    const seg = parts[idx];
    const isLast = idx === parts.length - 1;
    const results = [];
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (seg === "**") {
        if (ent.isDirectory()) results.push(...recurse(full, idx));
        results.push(...recurse(dir, idx + 1));
      } else if (seg.includes("*")) {
        const rx = new RegExp("^" + seg.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
        if (rx.test(ent.name)) {
          if (isLast && ent.isFile()) results.push(full);
          else if (!isLast && ent.isDirectory()) results.push(...recurse(full, idx + 1));
        }
      } else {
        if (ent.name === seg) {
          if (isLast && ent.isFile()) results.push(full);
          else if (!isLast && ent.isDirectory()) results.push(...recurse(full, idx + 1));
        }
      }
    }
    return [...new Set(results)];
  }
  let rootIdx = 0;
  while (rootIdx < parts.length && !parts[rootIdx].includes("*")) rootIdx++;
  const root = path.join(REPO, ...parts.slice(0, rootIdx));
  return recurse(root, rootIdx);
}

function resolveTargets(args) {
  if (args.file) {
    const f = path.isAbsolute(args.file) ? args.file : path.join(REPO, args.file);
    return [f];
  }
  if (args.page) {
    return [path.join(REPO, "src", "app", "[locale]", args.page, "page.tsx")];
  }
  if (args.glob) {
    return walkGlob(args.glob);
  }
  if (args.all) {
    return [
      ...walkGlob("src/app/[locale]/**/page.tsx"),
      ...walkGlob("src/components/**/*.tsx"),
    ];
  }
  return [];
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") out.all = true;
    else if (a.startsWith("--page=")) out.page = a.slice(7);
    else if (a === "--page") out.page = argv[++i];
    else if (a.startsWith("--file=")) out.file = a.slice(7);
    else if (a === "--file") out.file = argv[++i];
    else if (a.startsWith("--glob=")) out.glob = a.slice(7);
    else if (a === "--glob") out.glob = argv[++i];
    else if (a === "--dry") out.dry = true;
    else if (a === "--quiet") out.quiet = true;
  }
  return out;
}

const args = parseArgs(process.argv);
const targets = resolveTargets(args);

if (targets.length === 0) {
  console.error(
    "Usage: extract-strings.mjs --page <slug> | --file <path> | --glob <pat> | --all"
  );
  process.exit(2);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const summary = [];
let totalStrings = 0;
for (const t of targets) {
  if (!fs.existsSync(t)) {
    console.warn(`skip (missing): ${path.relative(REPO, t)}`);
    continue;
  }
  try {
    const result = extract(t);
    const slug = slugify(t);
    const outFile = path.join(OUT_DIR, `${slug}.json`);
    if (!args.dry) fs.writeFileSync(outFile, JSON.stringify(result, null, 2), "utf-8");
    summary.push({ file: result.file, strings: result.stringCount, slug });
    totalStrings += result.stringCount;
    if (!args.quiet) console.log(`${result.stringCount.toString().padStart(4)}  ${result.file}`);
  } catch (err) {
    console.error(`ERROR ${path.relative(REPO, t)}: ${err.message}`);
  }
}

if (!args.quiet) {
  console.log(`\nTotal: ${summary.length} file, ${totalStrings} string`);
}

const idxFile = path.join(OUT_DIR, "_index.json");
fs.writeFileSync(
  idxFile,
  JSON.stringify({ generatedAt: new Date().toISOString(), summary, totalStrings }, null, 2)
);
