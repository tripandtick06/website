"use client";

import { Link } from "@/i18n/routing";
import { Star, Quote, PenLine } from "lucide-react";
import { pickReviews } from "@/data/reviews";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tReviews } from "@/lib/i18n/localizeData";
import { ReviewScore } from "@/components/ui/ReviewScore";
import { Button } from "@/components/ui/Button";

const AVATAR_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-success",
  "bg-warning",
  "bg-rose-500",
  "bg-violet-500",
];

function formatDate(iso: string): string {
  // YYYY-MM-DD → DD.MM.YYYY (TR locale)
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function ReviewsSection() {
  const t = useT();
  const { locale } = useLocale();
  // Server-render'da tutarli olsun: seedKey sabit ("homepage").
  const reviews = tReviews(pickReviews(6, "homepage"), locale);

  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="section-tag">{t.component.sections.reviews.musteri_yorumlari}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.component.sections.reviews.happy_travelers}
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            {t.component.sections.reviews.trip_tick_guvenenlerin_gercek}
          </p>

          {/* booking imzasi: aggregate skor rozeti — sosyal kanit / guven. */}
          <div className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm">
            <ReviewScore rating={4.7} count={12000} format="ten" />
          </div>
        </div>

        <div className="text-center mb-8">
          <Button asChild variant="booking" size="sm" className="rounded-full">
            <Link href="/yorum">
              <PenLine className="w-4 h-4" aria-hidden />
              {t.component.sections.reviews.yorumunuzu_yazin}
            </Link>
          </Button>
          <p className="text-xs text-slate-400 mt-2">
            {t.component.sections.reviews.trip_tick_yasadiginiz_deneyimi}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {reviews.map((review, idx) => {
            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const initial = review.avatar || review.name[0] || "?";
            return (
              <article
                key={review.id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative flex flex-col"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-200" />
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex gap-0.5"
                    aria-label={`${review.rating} yıldız puan`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < review.rating
                            ? "w-4 h-4 text-warning fill-warning"
                            : "w-4 h-4 text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    {review.service}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <div
                    className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {initial}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {review.name}
                      <span aria-hidden>{review.flag}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(review.date)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
