"use client";

// B2B acente demo login — email + API key.
//
// Importers: Next.js auto-route /b2b/login. /b2b/page.tsx "B2B Giris" link.
// Affected: B2B acente authentication.
// Data: agencies.ts'ten getAgencyByEmail match. Basarili → localStorage[
//        'tripandtick:b2b:auth']=token, localStorage['tripandtick:b2b:agencyId']
//        =agency.id, redirect /b2b/dashboard.
// User verbatim: "Demo login: Email + API key (veya password). Demo:
// acente@example.com / tt_b2b_demo123. localStorage tripandtick:b2b:auth token
// + agencyId."

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, LogIn, Building2 } from "lucide-react";
import { getAgencyByEmail } from "@/data/agencies";

const AUTH_KEY = "tripandtick:b2b:auth";
const AGENCY_ID_KEY = "tripandtick:b2b:agencyId";

export default function B2BLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const agency = getAgencyByEmail(email);
      if (!agency) {
        setError("E-posta bulunamadı veya hesap pasif.");
        setLoading(false);
        return;
      }
      if (!agency.active) {
        setError("Hesabınız pasif. Lütfen destek ekibimizle iletişime geçin.");
        setLoading(false);
        return;
      }
      if (agency.apiKey !== apiKey.trim()) {
        setError("API key hatalı.");
        setLoading(false);
        return;
      }

      const token = `b2b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_KEY, token);
        window.localStorage.setItem(AGENCY_ID_KEY, agency.id);
      }
      router.replace("/b2b/dashboard");
    }, 400);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-accent/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-slate-900">
              <span className="text-accent">Trip</span> and{" "}
              <span className="text-accent">Tick</span>
            </h1>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Building2 className="w-3.5 h-3.5" />
            B2B Acente Paneli
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kurumsal E-posta
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="acente@example.com"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                placeholder="tt_b2b_..."
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="API key göster/gizle"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-2.5 rounded-lg disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Giriş yapılıyor..." : "Acente Girişi"}
          </button>
        </form>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
          <p className="font-semibold mb-1">Demo Erişim</p>
          <p>
            E-posta: <code className="bg-white px-1 rounded">acente@example.com</code>
          </p>
          <p>
            API Key: <code className="bg-white px-1 rounded">tt_b2b_demo123</code>
          </p>
          <p className="mt-1 text-amber-700">
            Faz 2&apos;de Supabase + OAuth2 acente authentication.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-center text-xs text-slate-400">
          <Link href="/b2b" className="hover:underline">
            ← B2B Programı hakkında bilgi
          </Link>
          <Link href="/" className="hover:underline">
            Ana siteye dön
          </Link>
        </div>
      </div>
    </main>
  );
}
