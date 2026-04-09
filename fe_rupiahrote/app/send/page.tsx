"use client";

import { Header } from "@/components/Header";
import { SendCard } from "@/components/SendCard";

export default function SendPage() {
  return (
    <>
      <Header />
      <main className="max-w-[1040px] mx-auto px-6 py-10">
        <SendCard />
      </main>
    </>
  );
}
