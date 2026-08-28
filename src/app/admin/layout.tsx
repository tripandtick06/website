// Admin root layout (SERVER) — /admin/* leeft buiten het [locale]-segment,
// dus dit layout MOET zelf <html>/<body> leveren. De app-root (src/app/layout.tsx)
// is een pass-through; zonder deze wrapper rendert Next het admin-document
// zonder <html>/<body>, waarna React-hydration crasht (#418/#423,
// "Only one element on document allowed") en de loginpagina direct na de
// eerste paint leeg klapt. Zie ook: [locale]/layout.tsx die hetzelfde doet
// voor de publieke site.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import AdminShell from "./AdminShell";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trip and Tick — Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" dir="ltr" className={inter.variable}>
      <body className="font-sans antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
