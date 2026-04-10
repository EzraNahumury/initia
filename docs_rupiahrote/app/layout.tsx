import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { TableOfContents } from "./components/TableOfContents";
import { ParticleBackground } from "./components/ParticleBackground";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RupiahRoute Docs",
  description: "Documentation for RupiahRoute, a Smart DeFi Router on Initia",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground font-sans">
        <ParticleBackground global />
        <div className="relative z-10 min-h-full flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex flex-1 min-w-0 justify-center px-8 py-8 lg:px-12 lg:py-10">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </main>
            <TableOfContents />
          </div>
        </div>
      </body>
    </html>
  );
}
