import { http, createConfig, createStorage, type Transport } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { rupiahRouteChain } from "./chain";

export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "3e748713fd9de3b75b5aeb857d8a4150";

const chains = [rupiahRouteChain] as const;

export const config = createConfig({
  chains,
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: "RupiahRoute",
        description: "Smart DeFi Router on Initia",
        url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        icons: ["/logo/logo.png"],
      },
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: "RupiahRoute",
      appLogoUrl: "/logo/logo.png",
    }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [rupiahRouteChain.id]: http("http://localhost:8545"),
  } as Record<(typeof chains)[number]["id"], Transport>,
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  }),
  ssr: true,
});
