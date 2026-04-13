export interface NavItem {
  title: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
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
