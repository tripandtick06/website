// Homepage newsletter signup section — block variant.
//
// Importers:
//   - src/app/page.tsx (between ReviewsSection and LoyaltySection)
// Affected: lead capture / hosgeldin bonusu funnel.
// Data: NewsletterForm POST /api/newsletter. No local data store.
// User verbatim: "Background gradient primary → accent, H2 'Hosgeldin Bonusu'
// + 'Aboneligin %5 indirim' + NewsletterForm block variant"

"use client";

import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { useT } from "@/lib/i18n/I18nProvider";

export function NewsletterSection() {
  const t = useT();
  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="relative py-16 sm:py-20 bg-gradient-to-br from-primary via-primary to-accent overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18), transparent 45%)",
        }}
      />
      <div className="container-main relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            {t.component.sections.newsletter.bulten}
          </span>
        </div>
        <NewsletterForm
          variant="block"
          source="homepage_section"
          headline="Hoşgeldin Bonusu"
          subline="Bültenimize abone olun, ilk rezervasyonunuzda %5 indirim kazanın. Sezon fırsatları doğrudan e-postanıza."
        />
      </div>
    </section>
  );
}
