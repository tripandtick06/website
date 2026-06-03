import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const runtime = "edge";

import { JsonLd } from "@/components/layout/JsonLd";
import { BALLOON_PACKAGES, getBalloonPackageBySlug } from "@/data/services/balloons";
import { OPERATORS } from "@/data/services/operators";
import { REVIEWS } from "@/data/reviews";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { tFaq } from "@/lib/i18n/localizeData";
import { formatPrice } from "@/lib/utils";
import {
  breadcrumbSchema,
  touristTripSchema,
  faqPageSchema,
  productSchema,
} from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { BalonDetayContent } from "./BalonDetayContent";

interface PageParams {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return BALLOON_PACKAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageParams): Metadata {
  const pkg = getBalloonPackageBySlug(params.slug);
  if (!pkg) return { title: "Paket Bulunamadı" };
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const path = `/balonlar/${pkg.slug}`;
  const priceLabel = pkg.priceOnRequest ? "Özel Fiyat" : formatPrice(pkg.adultPrice, pkg.currency);
  // Geo modifier: TR uses "Kapadokya", others use "Cappadocia" (universally searched).
  const geo = loc === "tr" ? "Kapadokya" : "Cappadocia";
  const ogTitle = `${pkg.name} — ${geo} ${priceLabel}`;
  return {
    title: `${pkg.name} — ${geo} ${priceLabel} | Trip and Tick`,
    description: pkg.shortDescription,
    alternates: {
      canonical: canonicalFor(path, params.locale),
      languages: generateHreflang(path),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: pkg.name,
      description: pkg.shortDescription,
      url: canonicalFor(path, params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(ogTitle, pkg.shortDescription),
          width: 1200,
          height: 630,
          alt: pkg.name,
        },
      ],
    },
  };
}

export default function BalonDetayPage({ params }: PageParams) {
  const pkg = getBalloonPackageBySlug(params.slug);
  if (!pkg) notFound();

  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const detailUrl = canonicalFor(`/balonlar/${pkg.slug}`, loc);
  const operators = OPERATORS.filter((op) => pkg.operatorIds.includes(op.id));
  const balonFaqs = tFaq(loc).filter((f) => f.category === "balon");
  const balonReviews = REVIEWS.filter(
    (r) => r.service === "Balon" && r.rating >= 4
  )
    .slice(0, 5)
    .map((r) => ({
      author: r.name,
      rating: r.rating,
      text: r.textEn ?? r.text,
      date: r.date,
      itemName: pkg.name,
    }));

  return (
    <>
      <BalonDetayContent pkg={pkg} operators={operators} balonFaqs={balonFaqs} />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: DICTIONARIES[loc].nav.balloons, href: canonicalFor("/balonlar", loc) },
            { name: pkg.name, href: detailUrl },
          ]),
          touristTripSchema({
            slug: pkg.slug,
            name: pkg.name,
            description: pkg.longDescription,
            duration: pkg.duration,
            price: pkg.adultPrice,
            currency: pkg.currency,
            rating: pkg.rating,
            reviewCount: pkg.reviewCount,
            urlPath: detailUrl,
            priceOnRequest: pkg.priceOnRequest,
          }),
          productSchema({
            slug: pkg.slug,
            name: pkg.name,
            description: pkg.shortDescription,
            image: pkg.images[0],
            price: pkg.adultPrice,
            currency: pkg.currency,
            rating: pkg.rating,
            reviewCount: pkg.reviewCount,
            category: "Kapadokya Balon Turu",
            urlPath: detailUrl,
            reviews: balonReviews,
            priceOnRequest: pkg.priceOnRequest,
          }),
          faqPageSchema(balonFaqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
    </>
  );
}
