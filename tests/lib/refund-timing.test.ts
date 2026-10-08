import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Stripe refunds settle in 5-10 business days. One number everywhere:
// "3-5 iş günü" (hesabim / cancel API) and a bare "5 iş günü" (dictionary,
// emails) contradicted the policy page. Reverting must be a visible act.
const ROOT = path.resolve(__dirname, "../..");
const FILES = [
  "src/lib/i18n/dictionaries.ts",
  "src/lib/email-templates.ts",
  "src/app/api/cancel/route.ts",
  "src/app/api/stripe/webhook/route.ts",
  "src/app/[locale]/hesabim/HesabimClient.tsx",
];
// 3-5 / bare 5 followed by a business-day word in any shipped locale.
const BAD =
  /(?<![\d–-])(3 ?[-–] ?5|5) (iş günü|is gunu|business days|Werktagen|jours ouvrables|días hábiles|werkdagen)|(?<![\d–-])(3 ?[-–] ?5|5)(个工作日)|(?<![\d–-])(3 ?[-–] ?5|5) (कार्य दिवसों|کاروباری دنوں)/;

describe("refund timing is 5-10 business days everywhere", () => {
  for (const f of FILES) {
    it(f, () => {
      const src = fs.readFileSync(path.join(ROOT, f), "utf8");
      const m = src.match(BAD);
      expect(m, m ? `stale refund timing: ${m[0]}` : "").toBeNull();
    });
  }
  it("dictionary carries the 5-10 wording in all 9 locales", () => {
    const src = fs.readFileSync(path.join(ROOT, FILES[0]), "utf8");
    for (const s of [
      "5-10 iş günü içinde kartınıza",
      "within 5-10 business days",
      "5-10 Werktagen",
      "5 à 10 jours ouvrés",
      "5-10 días hábiles",
      "5-10 werkdagen",
      "5-10个工作日内",
      "5-10 कार्य दिवसों",
      "5-10 کاروباری دنوں",
    ]) expect(src, s).toContain(s);
  });
});
