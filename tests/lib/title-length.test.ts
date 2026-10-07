import { describe, it, expect } from "vitest";
import { serverDict } from "@/lib/i18n/serverDict";
import type { Locale } from "@/lib/i18n/dictionaries";

// Final <title> = page meta_title + layout title.template ("%s | Trip and Tick").
// Mirrors generateMetadata in app/[locale]/{paketler,transferler}/page.tsx.
const TEMPLATE_SUFFIX = " | Trip and Tick";
const MAX = 60;
const INDEXABLE = ["tr", "en", "pt-BR", "ja", "fr", "de", "ko"] as const;
const GUARDED_PAGES = ["paketler", "transferler"] as const;

describe("title length guard (<=60 incl. brand suffix)", () => {
  for (const page of GUARDED_PAGES) {
    for (const loc of INDEXABLE) {
      it(`${loc} /${page}`, () => {
        const meta = (serverDict(loc as Locale) as any).page[page].meta_title as string;
        expect(typeof meta).toBe("string");
        const full = meta + TEMPLATE_SUFFIX;
        expect(full.length, `"${full}" is ${full.length} chars`).toBeLessThanOrEqual(MAX);
      });
    }
  }
});
