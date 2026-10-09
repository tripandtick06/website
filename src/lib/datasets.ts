// Sourced fact datasets (AI-citation lane): validation + published-JSON builder.
//
// Pattern ported from keukeninbeeld.nl (scripts/gen-datasets.mjs): a fact only
// enters the dataset with its own source (https url + literal quote + read
// date). A datapoint without those three fields fails the build loudly.
//
// Callers:
//   - scripts/gen-datasets.ts                       (prebuild; writes public/data/*.json)
//   - src/app/[locale]/cappadocia-balloon-facts-index/page.tsx
//   - tests/lib/datasets.test.ts
//
// Imports are relative on purpose: scripts/gen-datasets.ts runs under tsx
// without the "@/" alias.

export const DATASET_SITE_URL = "https://tripandtick.com";
export const QUOTE_MAX = 200;

// Page <title>/<meta description> of the Cappadocia facts index. Final title =
// this + layout title.template (16-char brand suffix); guarded in tests/lib/datasets.test.ts.
export const BALLOON_FACTS_META = {
  title: "Cappadocia Balloon Facts Index 2026",
  description:
    "Sourced facts on Cappadocia hot air ballooning: regulator, flight rules, wind limits, take-off areas, fleet and passenger numbers. Official sources, CC BY 4.0.",
} as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface DatapointSource {
  url: string;
  quote: string;
  read: string;
  quoteLang?: string;
}

export interface Datapoint {
  id: string;
  text: string;
  source: DatapointSource;
}

export interface DatasetSource {
  name: string;
  edition: string;
  slug: string;
  checked: string;
  description: string;
  datapoints: Datapoint[];
}

/** Returns every violation (empty array = valid). Never throws. */
export function validateDataset(raw: unknown): string[] {
  const errors: string[] = [];
  const ds = raw as Partial<DatasetSource> | null;
  if (!ds || typeof ds !== "object") return ["dataset is not an object"];
  for (const k of ["name", "edition", "slug", "description"] as const) {
    if (typeof ds[k] !== "string" || !(ds[k] as string).trim()) errors.push(`dataset.${k} missing`);
  }
  if (!ISO_DATE.test(ds.checked ?? "")) errors.push("dataset.checked must be YYYY-MM-DD");
  if (!Array.isArray(ds.datapoints) || ds.datapoints.length === 0) {
    errors.push("dataset.datapoints must be a non-empty array");
    return errors;
  }
  const ids = new Set<string>();
  for (const [i, dp] of ds.datapoints.entries()) {
    const id = dp?.id || `#${i}`;
    if (!dp?.id) errors.push(`datapoint ${id}: id missing`);
    else if (ids.has(dp.id)) errors.push(`datapoint ${id}: duplicate id`);
    else ids.add(dp.id);
    if (!dp?.text?.trim()) errors.push(`datapoint ${id}: text missing`);
    const s = dp?.source;
    if (!s || !/^https:\/\/[^\s]+$/.test(s.url ?? "")) errors.push(`datapoint ${id}: source.url must be https`);
    if (!s?.quote?.trim()) errors.push(`datapoint ${id}: source.quote missing`);
    else if (s.quote.length > QUOTE_MAX) errors.push(`datapoint ${id}: source.quote ${s.quote.length} chars > ${QUOTE_MAX}`);
    if (!ISO_DATE.test(s?.read ?? "")) errors.push(`datapoint ${id}: source.read must be YYYY-MM-DD`);
  }
  return errors;
}

export function buildPublishedDataset(ds: DatasetSource) {
  const url = `${DATASET_SITE_URL}/en/${ds.slug}`;
  return {
    name: ds.name,
    edition: ds.edition,
    description: ds.description,
    url,
    publisher: {
      name: "Trip and Tick",
      url: DATASET_SITE_URL,
      license: "https://creativecommons.org/licenses/by/4.0/",
      licenseName: "CC BY 4.0",
      citation: `Source: Trip and Tick – ${ds.name}, tripandtick.com/en/${ds.slug}`,
    },
    language: "en",
    updated: ds.checked,
    datapointCount: ds.datapoints.length,
    datapoints: ds.datapoints,
  };
}
