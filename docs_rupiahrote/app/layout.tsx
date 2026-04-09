import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { TableOfContents } from "./components/TableOfContents";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RupiahRoute Docs",
  description: "Documentation for RupiahRoute, a Smart DeFi Router on Initia",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 min-w-0 px-8 py-8 lg:px-12 lg:py-10 max-w-4xl">
            {children}
          </main>
          <TableOfContents />
        </div>
      </body>
    </html>
  );
}
