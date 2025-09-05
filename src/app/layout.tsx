import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/provider/provider";
import Script from "next/script";

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
        url: "https://fourteendency.nafaskarya.my.id/og-image.png",
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
      "https://fourteendency.nafaskarya.my.id/og-image.png",
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
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-jjsZxBcR_luxlQJS"
          strategy="beforeInteractive"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
