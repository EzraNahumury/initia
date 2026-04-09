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
  { symbol: "INIT", name: "Initia", address: "0x05439f13285527d44a840571beE6D61B86E5D4B4", decimals: 18, icon: "/tokens/init.svg", logoURI: `${IMG}/INIT.png`, denom: "uinit", tags: ["core", "native"] },
  { symbol: "USDC", name: "USD Coin", address: "0x68201164731AA9bF67adc452D073808085b01b0A", decimals: 6, icon: "/tokens/usdc.svg", logoURI: `${IMG}/USDC.png`, denom: "uusdc", tags: ["core", "stablecoin"] },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x8E4728da8Eb7384cC236997981C61F0Fb003D6F2", decimals: 18, icon: "/tokens/eth.svg", logoURI: `${IMG}/ETH.png`, denom: "ueth", tags: ["core"] },
  { symbol: "TIA", name: "Celestia", address: "0x6F21BC00E7B7803C7766Ab41eF223Fa58354B009", decimals: 6, icon: "/tokens/tia.svg", logoURI: `${IMG}/TIA.png`, denom: "utia", tags: ["core"] },
  { symbol: "IDRX", name: "IDRX", address: "0xD6a07783954C77D5118Bd39B493d2c45261BB8ac", decimals: 2, icon: "", logoURI: "https://assets.coingecko.com/coins/images/34883/standard/IDRX_BLUE_COIN_200x200.png", denom: "uidrx", tags: ["core", "stablecoin"] },
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
