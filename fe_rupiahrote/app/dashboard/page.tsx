"use client";

import { Header } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="max-w-[960px] mx-auto px-6 py-10">
        <DashboardView />
      </main>
    </>
  );
}
