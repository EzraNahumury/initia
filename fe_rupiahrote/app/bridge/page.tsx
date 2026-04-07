"use client";

import { Header } from "@/components/Header";
import { BridgeCard } from "@/components/BridgeCard";

export default function BridgePage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-[440px] mx-auto">
          <BridgeCard />
        </div>
      </main>
    </>
  );
}
