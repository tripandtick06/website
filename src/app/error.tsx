"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {

      console.error("[error.tsx]", error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="text-center max-w-xl">
        <div className="w-20 h-20 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-danger" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          Bir hata oluştu
        </h1>
        <p className="text-slate-600 leading-relaxed mb-2 max-w-md mx-auto">
          Sayfa yüklenirken beklenmedik bir sorun oluştu. Tekrar denemek ister misiniz?
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Hata kodu: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="btn-accent inline-flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" /> Tekrar Dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-all"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-8">
          Sorun devam ederse:{" "}
          <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
            info@tripandtick.com
          </a>
        </p>
      </div>
    </div>
  );
}
