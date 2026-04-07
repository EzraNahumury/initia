import { defineChain } from "viem";
import { sepolia } from "wagmi/chains";

// Initia MiniEVM Rollup (local) — aktif setelah `weave init` + `weave start`
export const rupiahRouteLocal = defineChain({
  id: 1212385660403083,
  name: "Rupiahrote-1",
  nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:8545"],
    },
  },
  blockExplorers: {
    default: {
      name: "Initia Scan",
      url: "https://scan.testnet.initia.xyz",
    },
  },
  testnet: true,
});

// Development: pakai Sepolia supaya wallet bisa connect
// Production: ganti ke rupiahRouteLocal setelah rollup running
const useLocalRollup = process.env.NEXT_PUBLIC_USE_LOCAL_ROLLUP === "true";

export const rupiahRouteChain = useLocalRollup ? rupiahRouteLocal : sepolia;
