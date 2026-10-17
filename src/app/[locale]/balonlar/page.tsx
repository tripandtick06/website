import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import {
  breadcrumbSchema,
  faqPageSchema,
  itemListSchema,
} from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import {
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { tBalloons, tFaq } from "@/lib/i18n/localizeData";
import { BalonlarContent } from "./BalonlarContent";
import { NlBalloonGuide } from "./NlBalloonGuide";
import { NL_BALLOON_FAQ, NL_GUIDE_LAST_UPDATED, NL_GUIDE_TITLE } from "@/data/i18n/nlBalloonGuide";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ORG_ID, SITE_URL, productSchema, touristTripSchema } from "@/lib/schema";

import { robotsForPage } from "@/lib/locale-index";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.balonlar;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    robots: robotsForPage(params.locale, "/balonlar"),
    alternates: {
      canonical: canonicalFor("/balonlar", params.locale),
      languages: generateHreflang("/balonlar"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/balonlar", params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(d.meta_title_2, d.meta_desc_2),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function BalonlarPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const balonFaqs = tFaq(loc).filter((f) => f.category === "balon");

  const isNl = loc === "nl";
  // nl: original Dutch guide + its FAQ (visible on page) joins the FAQPage node.
  const faqItems = [
    ...balonFaqs.map((f) => ({ question: f.question, answer: f.answer })),
    ...(isNl ? NL_BALLOON_FAQ : []),
  ];
  const nlUrl = canonicalFor("/balonlar", loc);
  const std = BALLOON_PACKAGES.find((b) => b.slug === "standart-balon-ucusu");
  const nlPkg = isNl && std ? tBalloons(loc).find((b) => b.slug === std.slug) : undefined;

  return (
    <>
      <BalonlarContent />
      {isNl && <NlBalloonGuide />}
      <JsonLd
        data={[
          ...(isNl && std
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "WebPage",
                  "@id": `${nlUrl}#webpage`,
                  url: nlUrl,
                  name: NL_GUIDE_TITLE,
                  inLanguage: "nl",
                  datePublished: NL_GUIDE_LAST_UPDATED,
                  dateModified: NL_GUIDE_LAST_UPDATED,
                  author: { "@type": "Organization", name: "Trip and Tick Redactie", url: SITE_URL },
                  publisher: { "@id": ORG_ID },
                },
                // Price is a STARTING price (from-pricing policy): Offer carries the "vanaf" amount only.
                touristTripSchema({
                  slug: std.slug,
                  name: nlPkg?.name ?? std.name,
                  description: nlPkg?.shortDescription ?? std.shortDescription,
                  duration: std.duration,
                  price: std.adultPrice,
                  currency: std.currency,
                  urlPath: nlUrl,
                }),
                productSchema({
                  slug: std.slug,
                  name: nlPkg?.name ?? std.name,
                  description: nlPkg?.shortDescription ?? std.shortDescription,
                  image: std.images[0],
                  price: std.adultPrice,
                  currency: std.currency,
                  category: "Ballonvaart Cappadocië",
                  urlPath: nlUrl,
                }),
              ]
            : []),
          breadcrumbSchema([{ name: serverDict(loc).nav.balloons, href: canonicalFor("/balonlar", loc) }]),
          itemListSchema(
            tBalloons(loc).map((pkg) => ({
              name: pkg.name,
              urlPath: canonicalFor(`/balonlar/${pkg.slug}`, loc),
            })),
            "Kapadokya Balon Turu Paketleri"
          ),
          faqPageSchema(faqItems),
        ]}
      />
    </>
  );
}
