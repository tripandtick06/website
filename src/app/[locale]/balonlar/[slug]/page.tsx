import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const runtime = "edge";

import { JsonLd } from "@/components/layout/JsonLd";
import { BALLOON_PACKAGES, getBalloonPackageBySlug } from "@/data/services/balloons";
import { OPERATORS } from "@/data/services/operators";
import { FAQ_ITEMS } from "@/data/faq";
import { REVIEWS } from "@/data/reviews";
import { formatPrice } from "@/lib/utils";
import {
  breadcrumbSchema,
  touristTripSchema,
  faqPageSchema,
  productSchema,
  SITE_URL,
} from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
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
  const path = `/balonlar/${pkg.slug}`;
  const priceLabel = pkg.priceOnRequest ? "Özel Fiyat" : formatPrice(pkg.adultPrice, pkg.currency);
  const ogTitle = `${pkg.name} — ${priceLabel}`;
  return {
    title: `${pkg.name} — ${priceLabel} | Trip and Tick`,
    description: pkg.shortDescription,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: generateHreflang(path),
    },
    openGraph: {
      title: pkg.name,
      description: pkg.shortDescription,
      url: `${SITE_URL}${path}`,
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

  const operators = OPERATORS.filter((op) => pkg.operatorIds.includes(op.id));
  const balonFaqs = FAQ_ITEMS.filter((f) => f.category === "balon");
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
            { name: "Balon Turları", href: "/balonlar" },
            { name: pkg.name, href: `/balonlar/${pkg.slug}` },
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
            reviews: balonReviews,
          }),
          faqPageSchema(balonFaqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
    </>
  );
}
