import type { Metadata } from "next";
import { canonicalFor, generateHreflang, ogImageUrl, ogLocale } from "@/lib/hreflang";
import {
  isLocale,
  DEFAULT_LOCALE,
} from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { JsonLd } from "@/components/layout/JsonLd";
import { websiteSchema, webPageSchema, SITE_URL } from "@/lib/schema";
import { LastUpdated } from "@/components/layout/LastUpdated";
import { PAGE_UPDATED } from "@/lib/page-dates";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { StepsSection } from "@/components/sections/StepsSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { LoyaltySection } from "@/components/sections/LoyaltySection";
import { StatsBar } from "@/components/sections/StatsBar";
import { MobileStickyCTA } from "@/components/sections/MobileStickyCTA";

import { robotsForPage } from "@/lib/locale-index";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const home = serverDict(loc).page.home;
  const title = home.meta_title;
  const description = home.meta_desc;
  const url = canonicalFor("/", loc);
  const ogImage = ogImageUrl(title, description);

  return {
    title,
    description,
    // nl home is re-opened (2026-10-17); layout default stays noindex for other pruned locales.
    robots: robotsForPage(loc, "/"),
    alternates: {
      canonical: url,
      languages: generateHreflang("/"),
      types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
    },
    openGraph: {
      type: "website",
      locale: ogLocale(loc),
      url,
      siteName: "Trip and Tick",
      // Brand-first og:title (geo brand_entity); <title> stays unchanged.
      title: title.startsWith("Trip and Tick") ? title : `Trip and Tick | ${title}`,
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
      <JsonLd data={websiteSchema(loc, serverDict(loc).page.home.meta_desc)} />
      <JsonLd
        data={webPageSchema({
          url: canonicalFor("/", loc),
          name: serverDict(loc).page.home.meta_title,
          locale: loc,
          dateModified: PAGE_UPDATED["/"],
        })}
      />
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <PackagesSection />
      <GuaranteeSection />
      <StepsSection />
      {/* ReviewsSection removed 2026-09-15: testimonials were mock data (src/data/reviews.ts). Re-add when moderated real reviews exist. */}
      <NewsletterSection />
      <LoyaltySection />
      <LastUpdated iso={PAGE_UPDATED["/"]} locale={loc} />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </>
  );
}
