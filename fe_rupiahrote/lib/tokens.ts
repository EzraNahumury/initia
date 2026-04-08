export const TOKEN_STYLE: Record<string, { bg: string; ring: string }> = {
  INIT:   { bg: "bg-blue-600",    ring: "ring-blue-100" },
  USDC:   { bg: "bg-sky-500",     ring: "ring-sky-100" },
  WETH:   { bg: "bg-violet-600",  ring: "ring-violet-100" },
  ETH:    { bg: "bg-violet-600",  ring: "ring-violet-100" },
  TIA:    { bg: "bg-rose-500",    ring: "ring-rose-100" },
  USDT:   { bg: "bg-emerald-500", ring: "ring-emerald-100" },
  WBTC:   { bg: "bg-orange-500",  ring: "ring-orange-100" },
  DAI:    { bg: "bg-amber-500",   ring: "ring-amber-100" },
  LINK:   { bg: "bg-blue-700",    ring: "ring-blue-100" },
  AAVE:   { bg: "bg-purple-600",  ring: "ring-purple-100" },
  ARB:    { bg: "bg-blue-500",    ring: "ring-blue-100" },
  COMP:   { bg: "bg-green-600",   ring: "ring-green-100" },
  CRV:    { bg: "bg-red-600",     ring: "ring-red-100" },
  LDO:    { bg: "bg-cyan-600",    ring: "ring-cyan-100" },
  GRT:    { bg: "bg-indigo-500",  ring: "ring-indigo-100" },
  ENS:    { bg: "bg-sky-600",     ring: "ring-sky-100" },
  MATIC:  { bg: "bg-purple-500",  ring: "ring-purple-100" },
  FET:    { bg: "bg-violet-500",  ring: "ring-violet-100" },
  "1INCH": { bg: "bg-red-500",   ring: "ring-red-100" },
  APE:    { bg: "bg-blue-400",    ring: "ring-blue-100" },
  IDRX:   { bg: "bg-blue-500",    ring: "ring-blue-100" },
};

export function tokenStyle(symbol: string) {
  return TOKEN_STYLE[symbol] ?? { bg: "bg-neutral-500", ring: "ring-neutral-100" };
}
