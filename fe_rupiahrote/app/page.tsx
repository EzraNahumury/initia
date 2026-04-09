"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SwapView } from "@/components/SwapView";
import { HeroSection } from "@/components/HeroSection";
import { WelcomePage } from "@/components/WelcomePage";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("rr_welcomed");
    if (!seen) setShowWelcome(true);
    setChecked(true);
  }, []);

  const handleEnter = () => {
    localStorage.setItem("rr_welcomed", "1");
    setShowWelcome(false);
  };

  if (!checked) return null;

  if (showWelcome) return <WelcomePage onEnter={handleEnter} />;

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="flex justify-center px-4 -mt-16 pb-16 relative z-10">
          <SwapView />
        </div>
      </main>
    </>
  );
}
