"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { SwapView } from "@/components/SwapView";
import { HeroSection } from "@/components/HeroSection";
import { WelcomePage } from "@/components/WelcomePage";

// Module-level flag — persists across route navigation within a session but
// resets on full page reload. So the welcome appears on first load per build
// and is skipped when the user clicks back to the swap tab.
let welcomeShownThisSession = false;

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(() => {
    if (welcomeShownThisSession) return false;
    welcomeShownThisSession = true;
    return true;
  });

  const handleEnter = () => {
    setShowWelcome(false);
  };

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
