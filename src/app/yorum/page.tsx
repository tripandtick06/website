// /yorum — Musteri yorum yazma sayfasi.
//
// Importers: Footer FOOTER_COMPANY + ReviewsSection CTA + Step6 onay (yonlendirme)
// Affected: yeni musteri yorum giris formu (UI shell + ClientForm).
// Data: ClientForm POST /api/yorum (createReview)
// User verbatim: "devam et"

import type { Metadata } from "next";
import { Star, CheckCircle2, Shield } from "lucide-react";
import { ClientForm } from "./ClientForm";

export const metadata: Metadata = {
  title: "Yorumunuzu Yazın | Trip and Tick",
  description:
    "Trip and Tick deneyiminizi paylaşın. Yorumunuz 24 saat içinde moderatör onayından sonra yayınlanır.",
  robots: { index: false, follow: false },
};

export default function YorumPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Müşteri Yorumu
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Deneyiminizi Paylaşın
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Trip and Tick ile yaşadığınız tatil deneyimini diğer misafirlerimizle
            paylaşın. Yorumunuz 24 saat içinde yayınlanır.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          <FeatureCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            title="Doğrulanmış"
            text="Gerçek müşteri deneyimleri."
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5 text-amber-600" />}
            title="Moderasyon"
            text="24 saat içinde onay."
          />
          <FeatureCard
            icon={<Star className="w-5 h-5 text-rose-500" />}
            title="5 Yıldız"
            text="Detaylı puanlama."
          />
        </div>

        <ClientForm />
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-bold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}
