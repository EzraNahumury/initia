"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { WalletButton } from "./WalletButton";
import { LanguageToggle } from "./LanguageToggle";
import {
  HiArrowsRightLeft, HiAdjustmentsHorizontal, HiSquares2X2,
  HiLink, HiChartBar, HiPaperAirplane, HiBeaker,
} from "react-icons/hi2";

export function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const NAV = [
    { href: "/", label: t("nav.swap"), icon: HiArrowsRightLeft },
    { href: "/limit", label: t("nav.limit"), icon: HiAdjustmentsHorizontal },
    { href: "/batch", label: t("nav.batch"), icon: HiSquares2X2 },
    { href: "/bridge", label: t("nav.bridge"), icon: HiLink },
    { href: "/send", label: t("nav.send"), icon: HiPaperAirplane },
    { href: "/dashboard", label: t("nav.dashboard"), icon: HiChartBar },
    { href: "/faucet", label: "Faucet", icon: HiBeaker },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo/logo.png" alt="Rupiah Rote" width={44} height={44} className="w-11 h-11 rounded-full object-cover" unoptimized />
          <span className="font-pixel text-[10px] text-purple-light tracking-wide">Rupiah Rote</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center border border-purple/20 rounded-full px-1.5 py-1 gap-0.5 bg-purple/10">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[8px] font-medium transition-all ${
                  active ? "bg-purple text-white glow-purple-sm" : "text-text-sub hover:text-purple-light"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
