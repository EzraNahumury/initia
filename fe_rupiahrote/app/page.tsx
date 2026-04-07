"use client";

import { Header } from "@/components/Header";
import { SwapCard } from "@/components/SwapCard";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="flex justify-center px-4 -mt-12 pb-16 relative z-10">
          <div className="w-full max-w-[440px]">
            <SwapCard />
          </div>
        </div>
      </main>
    </>
  );
}
