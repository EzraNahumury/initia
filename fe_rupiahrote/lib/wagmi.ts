import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { rupiahRouteChain } from "./chain";

export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "3e748713fd9de3b75b5aeb857d8a4150";

export const config = createConfig({
  chains: [rupiahRouteChain] as const,
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: "RupiahRoute",
        description: "Smart DeFi Router on Initia",
        url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        icons: ["/logo/logo.png"],
      },
      showQrModal: false,
    }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: "RupiahRoute",
      appLogoUrl: "/logo/logo.png",
    }),
  ],
  transports: Object.fromEntries([
    [rupiahRouteChain.id, http("http://localhost:8545")],
  ]),
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});
