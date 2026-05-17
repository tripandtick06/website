"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Tag,
  CalendarDays,
  Users,
  ClipboardList,
  Bot,
  LogOut,
  Menu,
  X,
  Ticket,
  UserCircle2,
  Sparkles,
  MessageSquare,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin?tab=fiyatlar", label: "Fiyatlar", icon: Tag },
  { href: "/admin?tab=rezervasyonlar", label: "Rezervasyonlar", icon: ClipboardList },
  { href: "/admin?tab=takvim", label: "Takvim", icon: CalendarDays },
  { href: "/admin?tab=operatorler", label: "Operatorler", icon: Users },
  { href: "/admin?tab=kuponlar", label: "Kuponlar", icon: Ticket },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin?tab=musteriler", label: "Musteriler", icon: UserCircle2 },
  { href: "/admin?tab=sadakat", label: "Sadakat", icon: Sparkles },
  { href: "/admin?tab=eposta", label: "E-posta", icon: Mail },
  { href: "/admin?tab=seo", label: "SEO Agent", icon: Bot },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // mounted gate: useSearchParams iceren admin sayfalari prerender'da fail eder.
  // Mount sonra render et — middleware zaten cookie auth halletmis durumda.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth httpOnly cookie ile middleware tarafindan korunuyor.
  // /admin/login disinda buraya gelen istek = cookie zaten dogrulanmis.
  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {
      // cookie zaten silinecek backend tarafindan; fail-safe redirect
    }
    router.replace("/admin/login");
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Yetki kontrol ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white p-4 flex-col gap-2 transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden lg:flex"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xl font-bold">
            <span className="text-amber-400">Trip and Tick</span>
            <span className="block text-xs text-slate-400 font-normal">Admin Panel v1.0</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-900/30 hover:text-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </aside>

      <div className="flex-1 lg:ml-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold">Trip and Tick Admin</span>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
