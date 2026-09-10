import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/core/providers";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMPUL DESA",
  description: "Sistem Intelijen Potensi dan Kesiapan Ekonomi Desa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#isi"
          className={`sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-body-md focus:text-ink ${FOCUS_RING}`}
        >
          Lompat ke konten utama
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
