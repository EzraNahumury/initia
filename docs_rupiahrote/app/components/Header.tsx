"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="RupiahRoute" className="w-8 h-8 shrink-0 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(159,41,255,0.3))" }} />
          <span className="font-semibold text-sm text-foreground">RupiahRoute Docs</span>
        </Link>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-foreground transition-colors">
          GitHub
        </a>
      </div>
    </header>
  );
}
