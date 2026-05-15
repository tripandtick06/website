import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { StepsSection } from "@/components/sections/StepsSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { LoyaltySection } from "@/components/sections/LoyaltySection";
import { StatsBar } from "@/components/sections/StatsBar";
import { MobileStickyCTA } from "@/components/sections/MobileStickyCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <PackagesSection />
      <GuaranteeSection />
      <StepsSection />
      <ReviewsSection />
      <LoyaltySection />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </>
  );
}
