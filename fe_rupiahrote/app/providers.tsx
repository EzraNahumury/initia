"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { useState } from "react";
import "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Only reconnect on mount if user previously connected
  const [shouldReconnect] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem("rr_user_connected")
  );

  return (
    <WagmiProvider config={config} reconnectOnMount={shouldReconnect}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
