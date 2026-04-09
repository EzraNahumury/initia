import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BackgroundEffect } from "@/components/BackgroundEffect";

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
  title: "Rupiah Rote — Smart DeFi Router on Initia",
  description: "Otomatis temukan jalur swap tercepat dan termurah di ekosistem Initia.",
  icons: { icon: "/logo/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${notoSansSC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <BackgroundEffect />
        <Providers><div className="relative z-10">{children}</div></Providers>
      </body>
    </html>
  );
}
