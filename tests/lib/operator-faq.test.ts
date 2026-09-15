import { describe, it, expect } from "vitest";
import { operatorFaqs } from "@/lib/operator-faq";
import { OPERATORS, getOperatorById } from "@/data/services/operators";
import { BALLOON_PACKAGES } from "@/data/services/balloons";

const ALLOWED_OPERATOR_KEYS = new Set([
  "id",
  "name",
  "aliases",
  "tagline",
  "taglineEn",
  "description",
  "descriptionEn",
  "website",
  "verifiedAt",
]);

const PHONE_PATTERN = /\+90|\b0\d{3}\b/;

describe("operatorFaqs", () => {
  const kaya = getOperatorById("kaya")!;
  const kayaPackages = BALLOON_PACKAGES.filter((p) => p.operatorIds.includes(kaya.id));

  const urgup = getOperatorById("urgup")!;
  const urgupPackages = BALLOON_PACKAGES.filter((p) => p.operatorIds.includes(urgup.id));

  it("has a real operator with packages and one without, for the fixtures below", () => {
    expect(kayaPackages.length).toBeGreaterThan(0);
    expect(urgupPackages.length).toBe(0);
  });

  it("returns 5 items for tr", () => {
    expect(operatorFaqs(kaya, kayaPackages, "tr")).toHaveLength(5);
  });

  it("returns 5 items for every non-tr locale", () => {
    for (const locale of ["en", "de", "fr", "es", "nl", "zh", "hi", "ur"]) {
      expect(operatorFaqs(kaya, kayaPackages, locale)).toHaveLength(5);
    }
  });

  it("price answer contains the cheapest package price when packages exist (tr + en)", () => {
    const cheapest = kayaPackages.reduce((min, p) => (p.adultPrice < min.adultPrice ? p : min));
    const priceDigits = String(cheapest.adultPrice);

    const trFaqs = operatorFaqs(kaya, kayaPackages, "tr");
    const enFaqs = operatorFaqs(kaya, kayaPackages, "en");
    expect(trFaqs[1].answer).toContain(priceDigits);
    expect(enFaqs[1].answer).toContain(priceDigits);
  });

  it("price answer points to /balonlar when there is no package (tr + en)", () => {
    const trFaqs = operatorFaqs(urgup, urgupPackages, "tr");
    const enFaqs = operatorFaqs(urgup, urgupPackages, "en");
    expect(trFaqs[1].answer).toMatch(/\/balonlar/);
    expect(enFaqs[1].answer).toMatch(/\/balonlar/);
  });

  it("never emits a phone number pattern, tr or en, with or without packages", () => {
    const allFaqs = [
      ...operatorFaqs(kaya, kayaPackages, "tr"),
      ...operatorFaqs(kaya, kayaPackages, "en"),
      ...operatorFaqs(urgup, urgupPackages, "tr"),
      ...operatorFaqs(urgup, urgupPackages, "en"),
    ];
    for (const faq of allFaqs) {
      expect(faq.question).not.toMatch(PHONE_PATTERN);
      expect(faq.answer).not.toMatch(PHONE_PATTERN);
    }
  });

  it("OPERATORS entries have no keys outside the honest Operator shape", () => {
    for (const op of OPERATORS) {
      for (const key of Object.keys(op)) {
        expect(ALLOWED_OPERATOR_KEYS.has(key), `unexpected key "${key}" on operator "${op.id}"`).toBe(
          true
        );
      }
    }
  });
});
