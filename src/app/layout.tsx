// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/provider/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fourteendency • Streetwear Yogyakarta",
  description:
    "Brand streetwear modern, original, dan minimalis dari Yogyakarta. Koleksi terbaru, desain keren, kualitas premium.",
  openGraph: {
    title: "Fourteendency • Streetwear Yogyakarta",
    description:
      "Brand streetwear modern, original, dan minimalis dari Yogyakarta. Koleksi terbaru, desain keren, kualitas premium.",
    url: "https://fourteendency.nafaskarya.my.id",
    siteName: "Fourteendency",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "https://fourteendency.nafaskarya.my.id/og-image.png", // <-- ganti ke OG image yang lo punya
        width: 1200,
        height: 630,
        alt: "Fourteendency Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fourteendency • Streetwear Yogyakarta",
    description: "Brand streetwear modern dari Yogyakarta.",
    images: [
      "https://fourteendency.nafaskarya.my.id/og-image.png", // <-- samain ama OG image di atas
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
