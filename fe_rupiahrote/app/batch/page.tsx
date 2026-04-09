"use client";

import { Header } from "@/components/Header";
import { BatchSwapCard } from "@/components/BatchSwapCard";

export default function BatchPage() {
  return (
    <>
      <Header />
      <main className="max-w-[860px] mx-auto px-6 py-10">
        <BatchSwapCard />
      </main>
    </>
  );
}
