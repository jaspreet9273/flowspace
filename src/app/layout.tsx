// ============================================================
// ROOT LAYOUT — Server Component
//
// LEARNING: Root layout wraps every page. Runs on the server.
// Sets HTML/body, global metadata, fonts, and providers.
//
// Font optimization: next/font/google downloads and self-hosts
// fonts at build time. In this sandbox we use system fonts
// as fallback since Google Fonts is blocked in build env.
// In production, uncomment the Inter import and remove the
// system font className.
// ============================================================

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/shared/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),

  title: {
    default: "Flowspace — Project Management",
    template: "%s | Flowspace",
  },
  description:
    "A modern project management dashboard built with Next.js App Router.",
  authors: [{ name: "Jaspreet singh" }],
  openGraph: {
    title: "Flowspace",
    description: "Project management dashboard",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white text-slate-900"
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
