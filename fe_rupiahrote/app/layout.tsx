import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export const metadata: Metadata = {
  title: "Rupiah Rote — Smart DeFi Router on Initia",
  description: "Otomatis temukan jalur swap tercepat dan termurah di ekosistem Initia.",
  icons: { icon: "/logo/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
