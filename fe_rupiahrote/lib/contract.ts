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
  { symbol: "INIT", name: "Initia", address: "0xED4D9eC06fdb95DfC9D6F3c269f0087c1e5bDE75", decimals: 18, icon: "/tokens/init.svg", logoURI: `${IMG}/INIT.png`, denom: "uinit", tags: ["core", "native"] },
  { symbol: "USDC", name: "USD Coin", address: "0xeaa2eA67c04cFE52df70F9cEA3880936600a3e88", decimals: 6, icon: "/tokens/usdc.svg", logoURI: `${IMG}/USDC.png`, denom: "uusdc", tags: ["core", "stablecoin"] },
  { symbol: "WETH", name: "Wrapped Ether", address: "0xeD073FCB76F37F2D2F719AFD209d6e1f132cD177", decimals: 18, icon: "/tokens/eth.svg", logoURI: `${IMG}/ETH.png`, denom: "ueth", tags: ["core"] },
  { symbol: "TIA", name: "Celestia", address: "0x283f603537E4Fa8427bc912C7CF5651dC0eB212f", decimals: 6, icon: "/tokens/tia.svg", logoURI: `${IMG}/TIA.png`, denom: "utia", tags: ["core"] },
  { symbol: "IDRX", name: "IDRX", address: "0x0bA49706D54087ae2216e14BEA8A1Ab98DB07855", decimals: 2, icon: "", logoURI: "https://assets.coingecko.com/coins/images/34883/standard/IDRX_BLUE_COIN_200x200.png", denom: "uidrx", tags: ["core", "stablecoin"] },
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
