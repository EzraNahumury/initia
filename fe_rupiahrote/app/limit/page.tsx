"use client";

import { Header } from "@/components/Header";
import { LimitOrderCard } from "@/components/LimitOrderCard";

export default function LimitPage() {
  return (
    <>
      <Header />
      <main className="max-w-[960px] mx-auto px-6 py-10">
        <LimitOrderCard />
      </main>
    </>
  );
}
