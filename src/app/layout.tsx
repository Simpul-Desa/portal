import type { Metadata } from "next";
import { Google_Sans_Flex, Geist_Mono } from "next/font/google";

import { PORTAL_URL } from "@/core/config";
import { Providers } from "@/core/providers";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import "./globals.css";

const googleSans = Google_Sans_Flex({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(PORTAL_URL),
  title: "SIMPUL DESA",
  description: "Sistem Intelijen Potensi dan Kesiapan Ekonomi Desa",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-simpul-desa.svg", type: "image/svg+xml" },
      { url: "/logo-simpul-desa.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo-simpul-desa.png",
  },
};

import { Toaster } from "@/shared/components/ui/sonner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${googleSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f1f2f6]">
        <a
          href="#isi"
          className={`sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-body-md focus:text-ink ${FOCUS_RING}`}
        >
          Lompat ke konten utama
        </a>
        <Providers>{children}</Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
