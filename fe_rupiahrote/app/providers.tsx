"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { config, projectId } from "@/lib/wagmi";
import { useState } from "react";
import "@/lib/i18n";

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: "light",
  themeVariables: {
    "--w3m-font-family": "var(--font-geist-sans), system-ui, sans-serif",
    "--w3m-accent": "#0a0a0a",
    "--w3m-color-mix": "#f5f5f5",
    "--w3m-color-mix-strength": 5,
    "--w3m-border-radius-master": "2px",
    "--w3m-z-index": 200,
  },
  featuredWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
    "18388be9ac2d02726dbac9777c68e1ca35b3c1ef2b11e56e1d6a2b37e27127e3", // Rabby
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709", // OKX
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust
  ],
  allWallets: "SHOW",
  enableAnalytics: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
