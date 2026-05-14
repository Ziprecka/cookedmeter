import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { canLoadAdSense, adsenseConfig } from "@/lib/adsense";
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
  title: "CookedMeter — Find Out How Cooked You Are",
  description:
    "Drop in your situation and get a cooked score, meme verdict, and recovery plan.",
  metadataBase: new URL("https://cookedmeter.com"),
  openGraph: {
    title: "CookedMeter — Find Out How Cooked You Are",
    description:
      "Drop in your situation and get a cooked score, meme verdict, and recovery plan.",
    url: "https://cookedmeter.com",
    siteName: "CookedMeter",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CookedMeter — Find Out How Cooked You Are",
    description:
      "Drop in your situation and get a cooked score, meme verdict, and recovery plan.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {canLoadAdSense() ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.clientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
