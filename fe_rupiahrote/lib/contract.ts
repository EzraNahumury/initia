import { RUPIAH_ROUTER_ABI } from "./abi";

export const ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_ROUTER_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const routerContract = {
  address: ROUTER_ADDRESS,
  abi: RUPIAH_ROUTER_ABI,
} as const;

// Token list — Uniswap Token List format for Initia ecosystem
export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  icon: string;
  logoURI?: string;
  denom: string;
  tags?: string[];
}

// Core tokens — AMM pool tokens. Logos from initia-registry.
const IMG = "https://raw.githubusercontent.com/initia-labs/initia-registry/main/images";
export const CORE_TOKENS: Token[] = [
  { symbol: "INIT", name: "Initia", address: "0x748254eD7bE134ABfaFB84Ff225f1E8E6F26A43C", decimals: 18, icon: "/tokens/init.svg", logoURI: `${IMG}/INIT.png`, denom: "uinit", tags: ["core", "native"] },
  { symbol: "USDC", name: "USD Coin", address: "0x7312008a312c3A7Ab132A69471F8afC362183Acc", decimals: 6, icon: "/tokens/usdc.svg", logoURI: `${IMG}/USDC.png`, denom: "uusdc", tags: ["core", "stablecoin"] },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x1EaB8CAc1fE6db5d3135f23094fE2Ce693b8031c", decimals: 18, icon: "/tokens/eth.svg", logoURI: `${IMG}/ETH.png`, denom: "ueth", tags: ["core"] },
  { symbol: "TIA", name: "Celestia", address: "0x7A7285180c7A9Bd27B1bde82D950c3C77B6c4343", decimals: 6, icon: "/tokens/tia.svg", logoURI: `${IMG}/TIA.png`, denom: "utia", tags: ["core"] },
  { symbol: "IDRX", name: "IDRX", address: "0xA2593B1bC08CAC2Cc000c86E8ed71EBC63Ab1E5C", decimals: 2, icon: "", logoURI: "https://assets.coingecko.com/coins/images/34883/standard/IDRX_BLUE_COIN_200x200.png", denom: "uidrx", tags: ["core", "stablecoin"] },
];

// All hardcoded tokens = core only. Extended list fetched from https://tokens.uniswap.org at runtime.
export const TOKENS: Token[] = [...CORE_TOKENS];

export function getToken(symbol: string): Token | undefined {
  return TOKENS.find((t) => t.symbol === symbol);
}

export function formatAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const frac = amount % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole}.${fracStr}`;
}

export function parseAmount(amount: string, decimals: number): bigint {
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = frac.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + fracPadded);
}

export function formatRupiah(usd: number): string {
  const idr = usd * 16000;
  return `Rp ${idr.toLocaleString("id-ID")}`;
}
