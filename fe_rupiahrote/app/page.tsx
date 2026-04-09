"use client";

import { Header } from "@/components/Header";
import { SwapView } from "@/components/SwapView";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-bg">
        <HeroSection />
        <div className="flex justify-center px-4 -mt-16 pb-16 relative z-10">
          <SwapView />
        </div>
      </main>
    </>
  );
}
