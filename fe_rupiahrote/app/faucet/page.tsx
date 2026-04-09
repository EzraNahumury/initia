"use client";

import { Header } from "@/components/Header";
import { FaucetCard } from "@/components/FaucetCard";

export default function FaucetPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <FaucetCard />
      </main>
    </>
  );
}
