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
  { symbol: "INIT", name: "Initia", address: "0x4e2F9DAFb2EAead388064362ADea0E2A773cFB57", decimals: 18, icon: "/tokens/init.svg", logoURI: `${IMG}/INIT.png`, denom: "uinit", tags: ["core", "native"] },
  { symbol: "USDC", name: "USD Coin", address: "0xE125C4D56B62CB27f405a41AB2163325Ad5f5331", decimals: 6, icon: "/tokens/usdc.svg", logoURI: `${IMG}/USDC.png`, denom: "uusdc", tags: ["core", "stablecoin"] },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x6cB5dF7218c56764AdeE52062469b0Fc16211fb8", decimals: 18, icon: "/tokens/eth.svg", logoURI: `${IMG}/ETH.png`, denom: "ueth", tags: ["core"] },
  { symbol: "TIA", name: "Celestia", address: "0xe2B7B1622395153a90B8d0846b6529F09Af8e563", decimals: 6, icon: "/tokens/tia.svg", logoURI: `${IMG}/TIA.png`, denom: "utia", tags: ["core"] },
  { symbol: "IDRX", name: "IDRX", address: "0xF87DA4d21B51c3DCB895ea62653Aa64024Dba2d7", decimals: 2, icon: "", logoURI: "https://assets.coingecko.com/coins/images/34883/standard/IDRX_BLUE_COIN_200x200.png", denom: "uidrx", tags: ["core", "stablecoin"] },
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

// Live USD→IDR rate. Seeded from localStorage cache (if present) on module load,
// then updated from the CoinGecko feed in SwapView. Falls back to 16000 if no
// data is available yet.
let _usdToIdr = 16000;
if (typeof window !== "undefined") {
  const cached = window.localStorage.getItem("_usdToIdr");
  const parsed = cached ? Number(cached) : NaN;
  if (parsed > 0) _usdToIdr = parsed;
}

export function setUsdToIdr(rate: number) {
  if (!rate || !Number.isFinite(rate) || rate <= 0) return;
  _usdToIdr = rate;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem("_usdToIdr", String(rate)); } catch { /* ignore */ }
  }
}

export function getUsdToIdr(): number {
  return _usdToIdr;
}

export function formatRupiah(usd: number): string {
  const idr = usd * _usdToIdr;
  return `Rp ${idr.toLocaleString("id-ID")}`;
}
