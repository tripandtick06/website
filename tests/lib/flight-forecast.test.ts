import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import { classify, slotsFromResponse } from "@/lib/flight-forecast";
import { flyingTodayCopy } from "@/data/i18n/flyingToday";
import { INDEXABLE_LOCALES } from "@/lib/locale-index";
import { generateHreflang, canonicalFor } from "@/lib/hreflang";

describe("flight outlook classification (conservative bands)", () => {
  it("calm sunrise = likely", () => {
    expect(classify({ windKmh: 6, gustKmh: 14, visibilityKm: 39, rainProbability: 0 })).toBe("likely");
  });
  it("wind 12-18 or gusts 25-35 = marginal", () => {
    expect(classify({ windKmh: 15, gustKmh: 20, visibilityKm: 20, rainProbability: 10 })).toBe("marginal");
    expect(classify({ windKmh: 8, gustKmh: 30, visibilityKm: 20, rainProbability: 10 })).toBe("marginal");
  });
  it("wind > 18, gusts > 35, fog or rain = unlikely", () => {
    expect(classify({ windKmh: 19, gustKmh: 20, visibilityKm: 20, rainProbability: 0 })).toBe("unlikely");
    expect(classify({ windKmh: 5, gustKmh: 40, visibilityKm: 20, rainProbability: 0 })).toBe("unlikely");
    expect(classify({ windKmh: 5, gustKmh: 10, visibilityKm: 1, rainProbability: 0 })).toBe("unlikely");
    expect(classify({ windKmh: 5, gustKmh: 10, visibilityKm: 20, rainProbability: 70 })).toBe("unlikely");
  });
  it("missing wind = unknown, never optimistic", () => {
    expect(classify({ windKmh: null, gustKmh: null, visibilityKm: null, rainProbability: null })).toBe("unknown");
  });
});

describe("slotsFromResponse", () => {
  it("reads the hourly row at the sunrise hour and converts visibility to km", () => {
    const slots = slotsFromResponse({
      hourly: {
        time: ["2026-09-16T05:00", "2026-09-16T06:00", "2026-09-16T07:00"],
        wind_speed_10m: [6.6, 5.7, 6.2],
        wind_gusts_10m: [14, 14.4, 13.3],
        visibility: [39440, 39420, 39340],
        precipitation_probability: [0, 0, 0],
        cloud_cover: [33, 33, 58],
      },
      daily: { time: ["2026-09-16"], sunrise: ["2026-09-16T06:22"] },
    });
    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({ date: "2026-09-16", sunrise: "06:22", windKmh: 5.7, gustKmh: 14.4, visibilityKm: 39.4, outlook: "likely" });
  });
});

describe("flying-today copy + routing", () => {
  it("has a full copy for every indexable locale and falls back to en", () => {
    for (const l of INDEXABLE_LOCALES) {
      const c = flyingTodayCopy(l);
      expect(c.h1.length).toBeGreaterThan(10);
      expect(c.faq).toHaveLength(5);
      expect(c.disclaimer).toMatch(/.{80,}/);
    }
    expect(flyingTodayCopy("es")).toBe(flyingTodayCopy("en"));
  });

  it("never claims a cancellation statistic", () => {
    for (const l of INDEXABLE_LOCALES) {
      const json = JSON.stringify(flyingTodayCopy(l));
      expect(json).not.toMatch(/\d+\s?%\s?(iptal|cancel|annul|absag|cancelamento|欠航|취소)/i);
    }
  });

  it("canonical + hreflang use the fully localized path (not first-segment only)", () => {
    expect(canonicalFor("/balonlar/bugun-ucuyor-mu", "en")).toBe("https://tripandtick.com/en/balloon-tours/flying-today");
    expect(canonicalFor("/balonlar/bugun-ucuyor-mu", "de")).toBe("https://tripandtick.com/de/heissluftballonfahrten/fliegen-heute");
    expect(canonicalFor("/balonlar/bugun-ucuyor-mu", "tr")).toBe("https://tripandtick.com/balonlar/bugun-ucuyor-mu");
    const h = generateHreflang("/balonlar/bugun-ucuyor-mu");
    expect(h["pt-BR"]).toBe("https://tripandtick.com/pt-BR/balloon-tours/flying-today");
    expect(h.fr).toBe("https://tripandtick.com/fr/vols-montgolfiere/vol-aujourd-hui");
    // first-segment behaviour for other paths unchanged
    expect(canonicalFor("/balonlar/deluxe-balon-ucusu", "en")).toBe("https://tripandtick.com/en/balloon-tours/deluxe-balon-ucusu");
  });
});
