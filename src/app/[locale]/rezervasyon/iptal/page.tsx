import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Ödeme İptal Edildi | Trip and Tick",
  description: "Ödeme işleminiz tamamlanmadı. Tekrar deneyebilirsiniz.",
  robots: { index: false, follow: false },
};

export default function CancelPage({ searchParams }: { searchParams: { slug?: string } }) {
  const retrySlug = searchParams?.slug ?? "standart-balon-ucusu";

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 lg:p-12 text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">Ödeme İptal Edildi</h1>
        <p className="text-slate-600 mb-6">
          Ödeme işleminiz tamamlanmadı, rezervasyonunuz oluşturulmadı.
          Endişelenmeyin — kartınızdan herhangi bir ücret çekilmedi.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-slate-700">
            <strong>Bilgi:</strong> Rezervasyon bilgileriniz tarayıcınızda saklı.
            Tekrar denediğinizde kaldığınız yerden devam edebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Link
            href={`/rezervasyon/${retrySlug}`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Tekrar Dene
          </Link>
          <a
            href="https://wa.me/905555555555"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Destek
          </a>
        </div>

        <div className="border-t border-slate-100 pt-6 text-xs text-slate-500">
          <p>Sorun yaşıyorsanız:</p>
          <p className="mt-1">
            <a href="mailto:hello@tripandtick.com" className="underline">hello@tripandtick.com</a> · +90 555 555 55 55
          </p>
        </div>
      </div>
    </main>
  );
}
