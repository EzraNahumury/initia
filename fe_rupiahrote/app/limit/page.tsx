"use client";

import { Header } from "@/components/Header";
import { LimitOrderCard } from "@/components/LimitOrderCard";

export default function LimitPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-[440px] mx-auto">
          <LimitOrderCard />
        </div>
      </main>
    </>
  );
}
