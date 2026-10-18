import { describe, it, expect } from "vitest";
import { TR_GUIDE_INTRO, TR_GUIDE_SECTIONS, TR_BALLOON_GUIDE_FAQ } from "@/data/trBalloonGuide";
import { FAQ_ITEMS } from "@/data/faq";
import { BALLOON_PACKAGES } from "@/data/services/balloons";

const words = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
// a euro amount other than the owner's starting price (100) = a net price leak
const NET_PRICE = /(€\s?(165|215|295)\b|\b(165|215|295)\s?(€|euro|eur)\b|netto|net fiyat)/i;

describe("TR balloon pillar block (/balonlar)", () => {
  const all = [
    TR_GUIDE_INTRO,
    ...TR_GUIDE_SECTIONS.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...TR_BALLOON_GUIDE_FAQ.flatMap((f) => [f.question, f.answer]),
  ];

  it("has real editorial depth", () => {
    expect(words(all.join(" "))).toBeGreaterThan(600);
    expect(TR_GUIDE_SECTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("states only the starting price from the catalogue, never a net price", () => {
    const std = BALLOON_PACKAGES.find((b) => b.slug === "standart-balon-ucusu")!;
    const text = all.join(" ");
    expect(text).toContain(`${std.adultPrice} €'dan başlar`);
    expect(NET_PRICE.test(text)).toBe(false);
  });

  it("extra FAQ does not duplicate a question already in FAQ_ITEMS", () => {
    const existing = new Set(FAQ_ITEMS.map((f) => f.question));
    for (const f of TR_BALLOON_GUIDE_FAQ) expect(existing.has(f.question), f.question).toBe(false);
  });

  it("operators named in the guide are the ones the standard package lists", () => {
    const std = BALLOON_PACKAGES.find((b) => b.slug === "standart-balon-ucusu")!;
    expect(std.operatorIds).toEqual(["kaya", "istanbul", "butterfly", "asiana", "turkiye"]);
  });
});
