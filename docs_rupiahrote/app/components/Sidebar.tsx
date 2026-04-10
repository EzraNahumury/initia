"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Getting Started",
    items: [
      { title: "Introduction", href: "/" },
      { title: "Quick Start", href: "/quickstart" },
      { title: "Architecture", href: "/architecture" },
    ],
  },
  {
    label: "Smart Contracts",
    items: [
      { title: "Overview", href: "/contracts" },
      { title: "RupiahRouter", href: "/contracts/router" },
      { title: "TokenFaucet", href: "/contracts/faucet" },
      { title: "Deployment", href: "/contracts/deployment" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { title: "Overview", href: "/frontend" },
      { title: "Swap & Routing", href: "/frontend/swap" },
      { title: "Features", href: "/frontend/features" },
      { title: "Wallet Integration", href: "/frontend/wallet" },
    ],
  },
  {
    label: "Guides",
    items: [
      { title: "Token List", href: "/guides/tokens" },
      { title: "DEX Comparison", href: "/guides/dex" },
      { title: "Initia Integration", href: "/guides/initia" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-border bg-card/50 overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)]">
      <nav className="px-4 py-6 space-y-6 flex-1">
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
      <div className="px-4 py-4 border-t border-border">
        <Link href="/contact"
          className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${
            pathname === "/contact"
              ? "bg-purple/10 text-purple-light font-medium"
              : "text-muted hover:text-foreground hover:bg-purple/5"
          }`}>
          Contact
        </Link>
      </div>
    </aside>
  );
}
