import Link from "next/link";
import { Wind, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white px-4">
      <div className="text-center max-w-xl">
        <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Wind className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl sm:text-8xl font-extrabold mb-3 tracking-tight">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Sayfa Bulunamadı</h2>
        <p className="text-white/80 leading-relaxed mb-8 max-w-md mx-auto">
          Aradığınız sayfa kaldırılmış, taşınmış veya hiç var olmamış olabilir.
          Endişelenmeyin — sizi en güzel destinasyonlara götürelim.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-accent inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </Link>
          <Link
            href="/balonlar"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-semibold text-white hover:bg-white/15 transition-all"
          >
            <MapPin className="w-4 h-4" /> Balon Turlarına Bak
          </Link>
        </div>
      </div>
    </div>
  );
}
