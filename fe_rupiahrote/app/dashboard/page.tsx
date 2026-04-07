"use client";

import { Header } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-[680px] mx-auto">
          <DashboardView />
        </div>
      </main>
    </>
  );
}
