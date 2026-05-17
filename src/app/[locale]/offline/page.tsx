import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { WifiOff } from "lucide-react";

export const runtime = "edge";


// Caller: public/sw.js line ~5 OFFLINE_URL constant; served when navigation fetch fails.
// No data file I/O. Static page.

export const metadata: Metadata = {
  title: "Çevrimdışı — İnternet Bağlantısı Yok | Trip and Tick",
  description:
    "İnternet bağlantınız bulunamadı. Daha önce ziyaret ettiğiniz sayfalar önbellekten görüntülenebilir.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F1B4D] via-primary to-[#2A1A4A] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-accent-light" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
          İnternet Bağlantısı Yok
        </h1>

        <p className="text-white/70 leading-relaxed mb-8">
          Şu anda çevrimdışısınız. Daha önce ziyaret ettiğiniz sayfalar
          önbellekten görüntülenebilir. Bağlantınızı kontrol edip tekrar
          deneyin.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-block w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors"
          >
            Ana Sayfa
          </Link>
          <a
            href="."
            className="inline-block w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-colors"
          >
            Yeniden Dene
          </a>
        </div>

        <div className="mt-10 text-xs text-white/40">
          Trip and Tick — Kapadokya Balon Turu
        </div>
      </div>
    </main>
  );
}
