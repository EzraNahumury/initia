import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RupiahRoute | Smart DeFi Router on Initia",
  description: "One interface, one click, best route. The engine handles pool selection, multi-hop routing, cross-chain bridging, and execution on an Initia EVM appchain with near-zero gas fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}