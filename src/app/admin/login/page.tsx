"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";

const AUTH_KEY = "tripandtick:admin:auth";
const DEMO_EMAIL = "admin@tripandtick.com";
const DEMO_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        const token = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_KEY, token);
        }
        router.replace("/admin");
      } else {
        setError("E-posta veya şifre hatalı.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-slate-900">
              <span className="text-amber-500">Trip</span> and <span className="text-amber-500">Tick</span>
            </h1>
          </Link>
          <p className="text-sm text-slate-500 mt-1">Admin Paneli Girişi</p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@tripandtick.com"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Şifreyi göster/gizle"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
          <p className="font-semibold mb-1">Demo Erişim Bilgileri</p>
          <p>E-posta: <code className="bg-white px-1 rounded">admin@tripandtick.com</code></p>
          <p>Şifre: <code className="bg-white px-1 rounded">admin123</code></p>
          <p className="mt-1 text-amber-700">Faz 2'de Supabase Auth + 2FA aktif olacak.</p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          <Link href="/" className="hover:underline">← Ana siteye dön</Link>
        </p>
      </div>
    </main>
  );
}
