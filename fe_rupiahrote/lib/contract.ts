import { RUPIAH_ROUTER_ABI } from "./abi";

export const ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_ROUTER_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const routerContract = {
  address: ROUTER_ADDRESS,
  abi: RUPIAH_ROUTER_ABI,
} as const;

// Token list — real Initia testnet tokens
export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  icon: string;
  denom: string;
}

export const TOKENS: Token[] = [
  {
    symbol: "INIT",
    name: "Initia",
    address: "0x0000000000000000000000000000000000000001",
    decimals: 6,
    icon: "/tokens/init.svg",
    denom: "uinit",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x0000000000000000000000000000000000000002",
    decimals: 6,
    icon: "/tokens/usdc.svg",
    denom: "uusdc",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000003",
    decimals: 6,
    icon: "/tokens/eth.svg",
    denom: "ueth",
  },
  {
    symbol: "TIA",
    name: "Celestia",
    address: "0x0000000000000000000000000000000000000004",
    decimals: 6,
    icon: "/tokens/tia.svg",
    denom: "utia",
  },
];

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
