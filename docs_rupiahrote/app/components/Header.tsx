"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { SearchModal } from "./SearchModal";
import { NAV } from "../lib/nav";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-1.5 -ml-1.5 text-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="RupiahRoute" width={32} height={32} className="shrink-0 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(159,41,255,0.3))" }} />
              <span className="font-semibold text-sm text-foreground hidden sm:block">RupiahRoute Docs</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50 text-muted hover:text-foreground hover:border-purple/30 hover:bg-card/80 transition-colors text-sm cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search docs...</span>
              <kbd className="hidden sm:inline ml-2 text-[10px] font-mono border border-border/50 rounded px-1.5 py-0.5 opacity-60">Ctrl+K</kbd>
            </button>
            <a href="https://github.com/EzraNahumury/initia" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block">
              GitHub
            </a>
          </div>
        </div>
      </header>
      
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 max-w-sm h-full bg-card border-r border-border shadow-2xl flex flex-col pt-6 overflow-y-auto animate-in slide-in-from-left">
            <button 
              className="absolute top-5 right-5 p-1 text-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 px-6">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/logo.png" alt="RupiahRoute" width={32} height={32} className="shrink-0 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(159,41,255,0.3))" }} />
                <span className="font-semibold text-sm text-foreground">RupiahRoute Docs</span>
              </Link>
            </div>
            <nav className="space-y-6 px-4 pb-6">
              {NAV.map((group) => (
                <div key={group.label}>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-2">
                    {group.label}
                  </h4>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${
                              active
                                ? "bg-purple/10 text-purple-light font-medium"
                                : "text-muted hover:text-foreground hover:bg-purple/5"
                            }`}>
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
