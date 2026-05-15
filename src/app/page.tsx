import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { StepsSection } from "@/components/sections/StepsSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { StatsBar } from "@/components/sections/StatsBar";

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

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <button className="w-full btn-accent !py-3.5 text-base">
          Hemen Rezervasyon Yap
        </button>
      </div>
    </>
  );
}
