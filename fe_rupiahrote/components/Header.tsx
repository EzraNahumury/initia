"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { WalletButton } from "./WalletButton";
import { LanguageToggle } from "./LanguageToggle";
import {
  HiArrowsRightLeft, HiClock, HiSquares2X2,
  HiArrowUpTray, HiChartBar, HiPaperAirplane,
} from "react-icons/hi2";

export function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const NAV = [
    { href: "/", label: t("nav.swap"), icon: HiArrowsRightLeft },
    { href: "/limit", label: t("nav.limit"), icon: HiClock },
    { href: "/batch", label: t("nav.batch"), icon: HiSquares2X2 },
    { href: "/bridge", label: t("nav.bridge"), icon: HiArrowUpTray },
    { href: "/send", label: t("nav.send"), icon: HiPaperAirplane },
    { href: "/dashboard", label: t("nav.dashboard"), icon: HiChartBar },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <Image src="/logo/logo.png" alt="RupiahRoute" width={100} height={100} className="w-20 h-auto" />
          <span className="font-semibold text-[15px] text-text tracking-tight">RupiahRoute</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center border border-border rounded-full px-1 py-1 gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  active ? "bg-text text-white" : "text-text-sub hover:text-text"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
