import type { Metadata } from "next";
import { canonicalFor, generateHreflang, ogImageUrl, ogLocale } from "@/lib/hreflang";
import {
  DICTIONARIES,
  isLocale,
  DEFAULT_LOCALE,
} from "@/lib/i18n/dictionaries";
import { JsonLd } from "@/components/layout/JsonLd";
import { websiteSchema } from "@/lib/schema";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { StepsSection } from "@/components/sections/StepsSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { LoyaltySection } from "@/components/sections/LoyaltySection";
import { StatsBar } from "@/components/sections/StatsBar";
import { MobileStickyCTA } from "@/components/sections/MobileStickyCTA";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const home = DICTIONARIES[loc].page.home;
  const title = home.meta_title;
  const description = home.meta_desc;
  const url = canonicalFor("/", loc);
  const ogImage = ogImageUrl(title, description);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: generateHreflang("/"),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(loc),
      url,
      siteName: "Trip and Tick",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const loc = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return (
    <>
      <JsonLd data={websiteSchema(loc)} />
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <PackagesSection />
      <GuaranteeSection />
      <StepsSection />
      <ReviewsSection />
      <NewsletterSection />
      <LoyaltySection />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </>
  );
}
