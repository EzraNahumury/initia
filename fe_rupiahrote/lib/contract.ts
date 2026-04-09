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
  { symbol: "INIT", name: "Initia", address: "0xBF7e690D436BA02b27F430936F86023F48CE8F5B", decimals: 18, icon: "/tokens/init.svg", logoURI: `${IMG}/INIT.png`, denom: "uinit", tags: ["core", "native"] },
  { symbol: "USDC", name: "USD Coin", address: "0x90Ea90Ec1e522b03c756C7d2C450933cDe9Bc92B", decimals: 6, icon: "/tokens/usdc.svg", logoURI: `${IMG}/USDC.png`, denom: "uusdc", tags: ["core", "stablecoin"] },
  { symbol: "WETH", name: "Wrapped Ether", address: "0xa7eE9d88c4F4C790521e48DAFB678Cd05EDFe7eB", decimals: 18, icon: "/tokens/eth.svg", logoURI: `${IMG}/ETH.png`, denom: "ueth", tags: ["core"] },
  { symbol: "TIA", name: "Celestia", address: "0xBB884856c62B5166205F7DBE1B6075b30C0C02Fc", decimals: 6, icon: "/tokens/tia.svg", logoURI: `${IMG}/TIA.png`, denom: "utia", tags: ["core"] },
  { symbol: "IDRX", name: "IDRX", address: "0x9E2AF517D6e4fD8539b72e426ED3f05e7bF7d7bd", decimals: 2, icon: "", logoURI: "https://assets.coingecko.com/coins/images/34883/standard/IDRX_BLUE_COIN_200x200.png", denom: "uidrx", tags: ["core", "stablecoin"] },
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
