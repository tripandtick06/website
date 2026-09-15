import type { Metadata } from "next";
import { canonicalFor, generateHreflang, ogImageUrl, ogLocale } from "@/lib/hreflang";
import {
  isLocale,
  DEFAULT_LOCALE,
} from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { JsonLd } from "@/components/layout/JsonLd";
import { websiteSchema } from "@/lib/schema";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { StepsSection } from "@/components/sections/StepsSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { LoyaltySection } from "@/components/sections/LoyaltySection";
import { StatsBar } from "@/components/sections/StatsBar";
import { MobileStickyCTA } from "@/components/sections/MobileStickyCTA";

// Static prerender (2026-09-16): this page reads only dictionaries/catalog —
// no headers()/cookies()/searchParams — so it is built once per locale and
// served as a static asset by Cloudflare Pages instead of edge-rendered per
// request (Lighthouse: ~0.9 s TTFB on every listing page). Live prices stay
// client-side. Guard: tests/lib/static-listing-pages.test.ts
export const dynamic = "force-static";
// next-on-pages: without dynamicParams=false the route is SSG-with-fallback
// and the Cloudflare build refuses it ("not configured to run with the Edge
// Runtime"). Locales come from the layout's generateStaticParams.
export const dynamicParams = false;

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
      {/* ReviewsSection removed 2026-09-15: testimonials were mock data (src/data/reviews.ts). Re-add when moderated real reviews exist. */}
      <NewsletterSection />
      <LoyaltySection />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </>
  );
}
