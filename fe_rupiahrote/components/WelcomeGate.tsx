"use client";

import { useState } from "react";
import { WelcomePage } from "./WelcomePage";

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) return <WelcomePage onEnter={() => setShowWelcome(false)} />;

  return <>{children}</>;
}
