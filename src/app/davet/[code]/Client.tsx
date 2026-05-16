"use client";

// /davet/[code] — Referans davet landing.
//
// Callers (external):
//   - WhatsApp/email/SMS uzerinden gelen davet linki
// Internal callers:
//   - src/components/sections/LoyaltySection.tsx (CTA)
//   - src/app/hesabim/page.tsx (Referans tab paylas)
// Glob check: src/app/davet/ daha once yoktu.
// Data: localStorage key `tripandtick:referral` = JSON {code, savedAt: ISO 8601}.
// User verbatim: "URL `/davet/TT-AB12CD` → 'Arkadaşınız sizi davet etti, %5 indirim kullanın!'
// localStorage `tripandtick:referral` = code, sonraki rezervasyonda otomatik uygula"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Gift, Sparkles, ChevronRight } from "lucide-react";

const STORAGE_KEY = "tripandtick:referral";

interface ReferrerInfo {
  exists: boolean;
  name?: string;
  code: string;
}

export default function DavetClient() {
  const params = useParams<{ code: string }>();
  const code = (params?.code ?? "").toUpperCase();
  const [info, setInfo] = useState<ReferrerInfo | null>(null);
  const [stored, setStored] = useState(false);

  useEffect(() => {
    if (!code) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ code, savedAt: new Date().toISOString() })
      );
      setStored(true);
    } catch {
      // ignore
    }

    fetch(`/api/davet?code=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.exists === "boolean") {
          setInfo({ exists: data.exists, name: data.name, code });
        } else {
          setInfo({ exists: false, code });
        }
      })
      .catch(() => setInfo({ exists: false, code }));
  }, [code]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 pt-[88px] pb-20">
      <div className="container-main max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 lg:p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-amber-100 flex items-center justify-center">
            <Gift className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {info?.exists && info.name
              ? `${info.name} sizi Trip and Tick'e davet etti!`
              : "Arkadasiniz sizi Trip and Tick'e davet etti!"}
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Ilk rezervasyonunuzda <strong className="text-amber-600">%5 indirim + 150 sadakat puani</strong> kazanin.
            Arkadasiniza da ayni bonus tahakkuk eder.
          </p>

          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 mb-6 inline-block">
            <p className="text-xs uppercase text-amber-700 font-semibold tracking-wide mb-1">
              Referans Kodunuz
            </p>
            <p className="text-3xl font-extrabold text-amber-700 tracking-wider font-mono">
              {code}
            </p>
            {stored && (
              <p className="text-xs text-emerald-700 mt-2 inline-flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3 h-3" />
                Kod kaydedildi — rezervasyonda otomatik uygulanir
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-sm">
            <Perk icon={<Sparkles className="w-5 h-5" />} title="150 Puan" desc="Hosgeldin bonusu" />
            <Perk icon={<Gift className="w-5 h-5" />} title="%5 Indirim" desc="Ilk rezervasyona" />
            <Perk icon={<CheckCircle2 className="w-5 h-5" />} title="%100 Iade" desc="Hava iptalinde" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/balonlar"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Balon Turu Sec <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/paketler"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-amber-300 text-amber-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-amber-50 transition-colors"
            >
              Paketleri Gor
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            Kodunuz son rezervasyonda ozet ekraninda gorunur. Rezervasyondan sonra <Link href="/hesabim" className="underline">hesabim</Link> sayfasindan puanlarinizi takip edebilirsiniz.
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          Sorulariniz mi var? <a href="mailto:info@tripandtick.com" className="text-amber-600 hover:underline">info@tripandtick.com</a> · WhatsApp <a href="https://wa.me/905001234567" className="text-amber-600 hover:underline">+90 500 123 45 67</a>
        </div>
      </div>
    </main>
  );
}

function Perk({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
        {icon}
      </div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}
