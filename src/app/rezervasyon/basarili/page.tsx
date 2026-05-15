import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Calendar, Mail, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Rezervasyon Onaylandı | Trip and Tick",
  description: "Rezervasyonunuz başarıyla tamamlandı.",
  robots: { index: false, follow: false },
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "TT-";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function SuccessPage({ searchParams }: { searchParams: { session_id?: string; demo?: string } }) {
  const code = generateCode();
  const isDemo = searchParams?.demo === "1";

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 lg:p-12 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-14 h-14 text-emerald-600" />
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">Teşekkürler!</h1>
        <p className="text-lg text-slate-600 mb-1">Rezervasyonunuz başarıyla oluşturuldu.</p>
        <p className="text-sm text-slate-500 mb-8">
          {isDemo
            ? "Demo modunda — gerçek ödeme yapılmadı, Stripe henüz yapılandırılmamış."
            : "Ödeme alındı ve bilgilendirme e-postası gönderildi."}
        </p>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-600 mb-2">Rezervasyon Kodu</p>
          <p className="text-3xl lg:text-4xl font-bold text-amber-700 tracking-wider font-mono">{code}</p>
          <p className="text-xs text-slate-500 mt-3">Bu kodu kaydedin — operatör onayı için gereklidir.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-left mb-8">
          <InfoCard icon={Mail} title="E-posta Onayı" body="Detaylar e-postanıza iletildi. Spam klasörünü kontrol edin." />
          <InfoCard icon={Calendar} title="Uçuş Hatırlatması" body="Uçuş günü 24 saat önce SMS ve e-posta ile hatırlatılır." />
          <InfoCard icon={CheckCircle2} title="Operatör Onayı" body="Operatör doğrulaması 2 saat içinde yapılır." />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold">
            <Home className="w-4 h-4" /> Ana Sayfa
          </Link>
          <Link href="/balonlar" className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium text-slate-700">
            Tekrar Rezervasyon
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Sorularınız için <a href="mailto:hello@tripandtick.com" className="underline">hello@tripandtick.com</a> veya{" "}
          <a href="https://wa.me/905555555555" className="underline" target="_blank" rel="noreferrer">WhatsApp</a>.
        </p>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <Icon className="w-5 h-5 text-amber-600 mb-2" />
      <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
      <p className="text-xs text-slate-600">{body}</p>
    </div>
  );
}
