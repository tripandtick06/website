"use client";

import { Star, CheckCircle2, Shield } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import { ClientForm } from "./ClientForm";

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

export function YorumContent() {
  const t = useT();
  const yorum = t.page.yorum;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {yorum.musteri_yorumu}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            {yorum.deneyiminizi_paylasin}
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            {yorum.trip_tick_yasadiginiz_tatil}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          <FeatureCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            title={yorum.featurecard_title_dogrulanmis}
            text={yorum.featurecard_text_gercek_musteri}
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5 text-amber-600" />}
            title={yorum.featurecard_title_moderasyon}
            text={yorum.featurecard_text_24_saat}
          />
          <FeatureCard
            icon={<Star className="w-5 h-5 text-rose-500" />}
            title={yorum.featurecard_title_yildiz}
            text={yorum.featurecard_text_detayli_puanlama}
          />
        </div>

        <ClientForm />
      </div>
    </main>
  );
}
