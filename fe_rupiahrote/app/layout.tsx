import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BackgroundEffect } from "@/components/BackgroundEffect";
import { WelcomeGate } from "@/components/WelcomeGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-cjk",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rupiah Router",
  description: "Otomatis temukan jalur swap tercepat dan termurah di ekosistem Initia.",
  openGraph: {
    title: "Rupiah Router",
    description: "Otomatis temukan jalur swap tercepat dan termurah di ekosistem Initia.",
    images: [{ url: "/logo/MascotIconBannerV2.png", width: 1200, height: 630, alt: "Rupiah Router" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rupiah Router — Smart DeFi Router on Initia",
    description: "Otomatis temukan jalur swap tercepat dan termurah di ekosistem Initia.",
    images: ["/logo/MascotIconBannerV2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${notoSansSC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <BackgroundEffect />
        <Providers><div className="relative z-10"><WelcomeGate>{children}</WelcomeGate></div></Providers>
      </body>
    </html>
  );
}
