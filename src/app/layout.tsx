// Root layout — passes children through to [locale] segment.
// next-intl pattern: <html>/<body> live in [locale]/layout.tsx (locale-aware).
// This file exists only because Next.js requires a root layout.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
