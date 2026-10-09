// /en/cappadocia-balloon-facts-index — sourced fact dataset (English only).
//
// Why (2026-10-09): assistants cite sites for fact questions ("how many
// balloons fly in Cappadocia", "is ballooning regulated"). Every row here
// carries its own official source URL + a literal quote; the same data ships
// as public/data/cappadocia-balloon-facts-index.json (scripts/gen-datasets.ts).
//
// English only: other locales answer 404 (no machine translation of sourced
// facts, no hreflang cluster). Source: src/data/datasets/cappadocia-balloon-facts.json

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, datasetSchema, SITE_URL } from "@/lib/schema";
import { canonicalFor, ogImageUrl } from "@/lib/hreflang";
import { BALLOON_FACTS_META, buildPublishedDataset, type DatasetSource } from "@/lib/datasets";
import source from "@/data/datasets/cappadocia-balloon-facts.json";

export const runtime = "edge";

const PATH = "/cappadocia-balloon-facts-index";
const ds = source as DatasetSource;
const published = buildPublishedDataset(ds);
const JSON_PATH = `/data/${ds.slug}.json`;

const META_TITLE = BALLOON_FACTS_META.title;
const META_DESCRIPTION = BALLOON_FACTS_META.description;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (params.locale !== "en") return {};
  const url = canonicalFor(PATH, "en");
  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      locale: "en_US",
      title: META_TITLE,
      description: META_DESCRIPTION,
      url,
      type: "website",
      images: [{ url: ogImageUrl(META_TITLE, "Sourced facts · CC BY 4.0"), width: 1200, height: 630, alt: META_TITLE }],
    },
  };
}

const hostOf = (u: string) => new URL(u).hostname.replace(/^www\./, "");

export default function BalloonFactsIndexPage({ params }: { params: { locale: string } }) {
  if (params.locale !== "en") notFound();
  const pageUrl = canonicalFor(PATH, "en");

  return (
    <>
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
        <div className="container-main py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">{ds.name}</h1>
          <p className="text-white/85 text-lg max-w-3xl">{ds.description}</p>
          <p className="text-white/70 text-sm mt-4">
            Edition {ds.edition} · last checked {ds.checked} · {ds.datapoints.length} facts · licence CC BY 4.0
          </p>
        </div>
      </section>

      <div className="bg-slate-50 py-10">
        <div className="container-main space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Cappadocia hot air balloon facts with sources</caption>
              <thead>
                <tr className="text-slate-500">
                  <th scope="col" className="py-2 pr-4 w-10">#</th>
                  <th scope="col" className="py-2 pr-4">Fact</th>
                  <th scope="col" className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {ds.datapoints.map((dp, i) => (
                  <tr key={dp.id} id={dp.id} className="border-t border-slate-200 align-top">
                    <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                    <td className="py-3 pr-4 text-slate-900">{dp.text}</td>
                    <td className="py-3 text-slate-700">
                      <a href={dp.source.url} rel="noopener" className="text-primary underline break-all">
                        {hostOf(dp.source.url)}
                      </a>
                      <details className="mt-1">
                        <summary className="cursor-pointer text-slate-600">Quote · read {dp.source.read}</summary>
                        <blockquote lang={dp.source.quoteLang} className="mt-1 border-l-2 border-slate-300 pl-3 text-slate-600">
                          {dp.source.quote}
                        </blockquote>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold mb-2">Cite this dataset</h2>
            <p className="text-slate-700 mb-2">{published.publisher.citation}</p>
            <p className="text-slate-700">
              Licence: <a className="text-primary underline" href={published.publisher.license} rel="license noopener">CC BY 4.0</a>
              {" · "}Machine-readable edition:{" "}
              <a className="text-primary underline" href={JSON_PATH}>{JSON_PATH}</a>
            </p>
            <p className="text-slate-500 text-sm mt-3">
              Rules and statistics are quoted from the cited official documents on the date shown and can change; the
              regulator&apos;s current text always prevails. The price row is Trip and Tick&apos;s own starting price.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold mb-2">Related</h2>
            <ul className="list-disc pl-5 space-y-1 text-primary">
              <li><Link className="underline" href="/en/balloon-tours/standart-balon-ucusu">Standard Cappadocia balloon flight (from €100)</Link></li>
              <li><Link className="underline" href="/en/balloon-tours/flying-today">Are the balloons flying today?</Link></li>
              <li><Link className="underline" href="/en/faq">Frequently asked questions</Link></li>
            </ul>
          </section>
        </div>
      </div>

      <JsonLd
        data={[
          datasetSchema({
            name: ds.name,
            description: ds.description,
            pageUrl,
            jsonUrl: `${SITE_URL}${JSON_PATH}`,
            datePublished: ds.checked,
            dateModified: ds.checked,
            keywords: ["Cappadocia", "hot air balloon", "balloon regulation", "SHGM", "balloon statistics", "Türkiye"],
            spatialCoverage: "Cappadocia, Türkiye",
          }),
          breadcrumbSchema([
            { name: "Home", href: canonicalFor("/", "en") },
            { name: "Cappadocia Balloon Facts Index", href: pageUrl },
          ]),
        ]}
      />
    </>
  );
}
