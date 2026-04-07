export const TOKEN_STYLE: Record<string, { bg: string; ring: string }> = {
  INIT: { bg: "bg-blue-600", ring: "ring-blue-100" },
  USDC: { bg: "bg-sky-500", ring: "ring-sky-100" },
  ETH: { bg: "bg-violet-600", ring: "ring-violet-100" },
  TIA: { bg: "bg-rose-500", ring: "ring-rose-100" },
};

export function tokenStyle(symbol: string) {
  return TOKEN_STYLE[symbol] ?? { bg: "bg-neutral-500", ring: "ring-neutral-100" };
}
