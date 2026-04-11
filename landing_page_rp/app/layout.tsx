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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}