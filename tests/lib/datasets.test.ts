import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import source from "@/data/datasets/cappadocia-balloon-facts.json";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { fromPriceShort } from "@/lib/price-label";
import {
  BALLOON_FACTS_META,
  QUOTE_MAX,
  buildPublishedDataset,
  validateDataset,
  type DatasetSource,
} from "@/lib/datasets";
import { TITLE_BRAND_SUFFIX_LEN, TITLE_MAX } from "@/lib/title";

const ROOT = path.resolve(__dirname, "../..");
const ds = source as DatasetSource;
const clone = () => JSON.parse(JSON.stringify(ds)) as DatasetSource;

// Guard for the sourced fact dataset (keukeninbeeld pattern): no datapoint
// without https url + literal quote + read date. Deleting these tests is the
// visible act that would be needed to publish an unsourced number.
describe("datasets validation guard", () => {
  it("the shipped dataset is valid, 10-15 facts", () => {
    expect(validateDataset(ds)).toEqual([]);
    expect(ds.datapoints.length).toBeGreaterThanOrEqual(10);
    expect(ds.datapoints.length).toBeLessThanOrEqual(15);
  });

  it("rejects a datapoint without a quote", () => {
    const bad = clone();
    bad.datapoints[0].source.quote = "";
    expect(validateDataset(bad).join("\n")).toMatch(/quote missing/);
    delete (bad.datapoints[1].source as { quote?: string }).quote;
    expect(validateDataset(bad).length).toBe(2);
  });

  it("rejects non-https urls, missing read dates, over-long quotes and duplicate ids", () => {
    const bad = clone();
    bad.datapoints[0].source.url = "http://example.com/x";
    bad.datapoints[1].source.read = "";
    bad.datapoints[2].source.quote = "x".repeat(QUOTE_MAX + 1);
    bad.datapoints[3].id = bad.datapoints[4].id;
    const msg = validateDataset(bad).join("\n");
    expect(msg).toMatch(/source\.url must be https/);
    expect(msg).toMatch(/source\.read must be YYYY-MM-DD/);
    expect(msg).toMatch(/> 200/);
    expect(msg).toMatch(/duplicate id/);
  });

  it("every Turkish quote is flagged quoteLang=tr and sources are official/primary hosts", () => {
    const OK_HOSTS = /^(web\.shgm\.gov\.tr|www\.nevsehir\.gov\.tr|tripandtick\.com)$/;
    for (const dp of ds.datapoints) {
      expect(new URL(dp.source.url).hostname, dp.id).toMatch(OK_HOSTS);
      if (dp.source.quote !== "catalog") expect(dp.source.quoteLang, dp.id).toBe("tr");
    }
  });
});

describe("price datapoint stays 'from' pricing and tied to the catalogue", () => {
  const std = BALLOON_PACKAGES.find((b) => b.slug === "standart-balon-ucusu")!;
  const dp = ds.datapoints.find((d) => d.id === "tat-standard-from-price")!;
  it("states the catalogue starting price in 'from' form, never a net/fixed price", () => {
    expect(dp.source.quote).toBe("catalog");
    expect(dp.text).toContain(fromPriceShort("en", std.adultPrice, std.currency));
    expect(dp.text).toMatch(/starting price, not a fixed price/);
  });
});

describe("published JSON + page wiring", () => {
  it("public/data json is in sync with the source and carries the publisher block", () => {
    const pub = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/cappadocia-balloon-facts-index.json"), "utf8"));
    expect(pub).toEqual(JSON.parse(JSON.stringify(buildPublishedDataset(ds))));
    expect(pub.datapointCount).toBe(ds.datapoints.length);
    expect(pub.updated).toBe(ds.checked);
    expect(pub.publisher.name).toBe("Trip and Tick");
    expect(pub.publisher.licenseName).toBe("CC BY 4.0");
    expect(pub.publisher.citation).toBe(
      "Source: Trip and Tick – Cappadocia Hot Air Balloon Facts Index 2026, tripandtick.com/en/cappadocia-balloon-facts-index"
    );
  });

  it("title fits 60 chars incl. brand suffix; description <= 160", () => {
    expect(BALLOON_FACTS_META.title.length + TITLE_BRAND_SUFFIX_LEN).toBeLessThanOrEqual(TITLE_MAX);
    expect(BALLOON_FACTS_META.description.length).toBeLessThanOrEqual(160);
  });

  it("prebuild generates the dataset; sitemap, llms.txt and headers reference it", () => {
    const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
    expect(JSON.parse(read("package.json")).scripts.prebuild).toContain("gen-datasets.ts");
    expect(read("src/app/sitemap.ts")).toContain("/en/cappadocia-balloon-facts-index");
    expect(read("public/llms.txt")).toContain("/en/cappadocia-balloon-facts-index?utm_source=llms");
    expect(read("public/llms.txt")).toContain("/data/cappadocia-balloon-facts-index.json?utm_source=llms");
    const headers = read("public/_headers");
    expect(headers).toMatch(/\/data\/\*\s+Access-Control-Allow-Origin: \*\s+X-Robots-Tag: noindex/);
  });

  it("page is English-only (non-en locales 404)", () => {
    const page = fs.readFileSync(path.join(ROOT, "src/app/[locale]/cappadocia-balloon-facts-index/page.tsx"), "utf8");
    expect(page).toMatch(/params\.locale !== "en"\) notFound\(\)/);
  });
});
