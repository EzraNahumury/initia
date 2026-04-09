"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  parseAmount,
  formatAmount,
  TOKENS,
  type Token,
} from "@/lib/contract";
import { routerContract, ROUTER_ADDRESS } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { tokenStyle } from "@/lib/tokens";
import { SlippageSettings } from "./SlippageSettings";
import { PriceImpactBadge, PriceImpactWarning } from "./PriceImpactBadge";
import { RecipientToggle } from "./RecipientToggle";
import { SwapConfirmModal } from "./SwapConfirmModal";
import { addActivity } from "@/lib/activity";
import { awardXP } from "@/lib/xp";
import { fetchAllDexQuotes, type DexQuote } from "@/lib/dex-quotes";
import {
  HiArrowsUpDown,
  HiCheckCircle,
  HiBolt,
} from "react-icons/hi2";

const World = dynamic(() => import("./ui/globe").then((m) => m.World), { ssr: false });

const globeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

const arcColors = ["#06b6d4", "#3b82f6", "#6366f1"];
const globeArcs = [
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.1, color: arcColors[0] },
  { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: arcColors[1] },
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -1.303396, endLng: 36.852443, arcAlt: 0.5, color: arcColors[2] },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: arcColors[0] },
  { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3, color: arcColors[1] },
  { order: 2, startLat: -15.785493, startLng: -47.909029, endLat: 36.162809, endLng: -115.119411, arcAlt: 0.3, color: arcColors[2] },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: arcColors[0] },
  { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3, color: arcColors[1] },
  { order: 3, startLat: -6.2088, startLng: 106.8456, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: arcColors[2] },
  { order: 4, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.5, color: arcColors[0] },
  { order: 4, startLat: -34.6037, startLng: -58.3816, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.7, color: arcColors[1] },
  { order: 5, startLat: 14.5995, startLng: 120.9842, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: arcColors[2] },
  { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.2, color: arcColors[0] },
  { order: 6, startLat: -15.432563, startLng: 28.315853, endLat: 1.094136, endLng: -63.34546, arcAlt: 0.7, color: arcColors[1] },
  { order: 6, startLat: 37.5665, startLng: 126.978, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.1, color: arcColors[2] },
  { order: 7, startLat: -19.885592, startLng: -43.951191, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.1, color: arcColors[0] },
  { order: 7, startLat: 48.8566, startLng: -2.3522, endLat: 52.52, endLng: 13.405, arcAlt: 0.1, color: arcColors[1] },
  { order: 8, startLat: 1.3521, startLng: 103.8198, endLat: 40.7128, endLng: -74.006, arcAlt: 0.5, color: arcColors[2] },
  { order: 9, startLat: 51.5072, startLng: -0.1276, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: arcColors[0] },
  { order: 9, startLat: 22.3193, startLng: 114.1694, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.7, color: arcColors[1] },
  { order: 10, startLat: -22.9068, startLng: -43.1729, endLat: 28.6139, endLng: 77.209, arcAlt: 0.7, color: arcColors[2] },
  { order: 10, startLat: 34.0522, startLng: -118.2437, endLat: 31.2304, endLng: 121.4737, arcAlt: 0.3, color: arcColors[0] },
  { order: 10, startLat: -6.2088, startLng: 106.8456, endLat: 52.3676, endLng: 4.9041, arcAlt: 0.3, color: arcColors[1] },
  { order: 11, startLat: 41.9028, startLng: 12.4964, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: arcColors[2] },
  { order: 12, startLat: 35.6762, startLng: 139.6503, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.2, color: arcColors[0] },
  { order: 13, startLat: 52.52, startLng: 13.405, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: arcColors[1] },
  { order: 14, startLat: -33.936138, startLng: 18.436529, endLat: 21.395643, endLng: 39.883798, arcAlt: 0.3, color: arcColors[2] },
];

/* ── Fallback rates (used when CoinGecko API unavailable) ── */

const FALLBACK_RATES: Record<string, number> = {
  "INIT-USDC": 0.985,  "USDC-INIT": 1.015,
  "INIT-ETH": 0.00052, "ETH-INIT": 1923,
  "INIT-TIA": 0.95,    "TIA-INIT": 1.053,
  "USDC-ETH": 0.000528,"ETH-USDC": 1893,
  "USDC-TIA": 0.965,   "TIA-USDC": 1.036,
  "ETH-TIA": 1830,     "TIA-ETH": 0.000547,
  "INIT-USDT": 0.984,  "USDT-INIT": 1.016,
  "INIT-ATOM": 0.105,  "ATOM-INIT": 9.52,
  "INIT-OSMO": 1.58,   "OSMO-INIT": 0.633,
  "INIT-INJ": 0.043,   "INJ-INIT": 23.26,
  "INIT-SEI": 2.34,    "SEI-INIT": 0.427,
  "INIT-WBTC": 0.0000098, "WBTC-INIT": 102040,
  "USDC-USDT": 0.999,  "USDT-USDC": 1.001,
  "USDC-ATOM": 0.107,  "ATOM-USDC": 9.35,
  "ETH-WBTC": 0.0186,  "WBTC-ETH": 53.76,
  "INIT-IDRX": 15800,  "IDRX-INIT": 0.0000633,
  "USDC-IDRX": 16050,  "IDRX-USDC": 0.0000623,
  "IDRX-WETH": 0.0000000248, "WETH-IDRX": 40320000,
};

/* ── CoinGecko live price feed ─────────────────────────────── */

const COINGECKO_IDS: Record<string, string> = {
  INIT: "initia",
  USDC: "usd-coin",
  WETH: "ethereum",
  ETH: "ethereum",
  TIA: "celestia",
  USDT: "tether",
  ATOM: "cosmos",
  OSMO: "osmosis",
  INJ: "injective-protocol",
  SEI: "sei-network",
  WBTC: "bitcoin",
  BTC: "bitcoin",
};

const IDRX_USD_RATE = 1 / 16050;

function useLivePrices() {
  const ids = [...new Set(Object.values(COINGECKO_IDS))].join(",");
  return useQuery({
    queryKey: ["coingecko-prices"],
    queryFn: async (): Promise<Record<string, number>> => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      );
      if (!res.ok) throw new Error("CoinGecko API error");
      const data = await res.json();
      const prices: Record<string, number> = {};
      for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
        if (data[geckoId]?.usd) prices[symbol] = data[geckoId].usd;
      }
      prices["IDRX"] = IDRX_USD_RATE;
      return prices;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });
}

function getLiveRate(
  prices: Record<string, number>,
  from: string,
  to: string,
): number | null {
  const f = prices[from];
  const t = prices[to];
  return f && t ? f / t : null;
}

/* ── External DEXs now fetched from lib/dex-quotes.ts ──── */

/* ── Route generation ──────────────────────────────────────── */

interface SimRoute {
  name: string;
  protocol: string;
  output: string;
  outputNum: number;
  gas: string;
  gasUsd: string;
  best: boolean;
  diff: number | null;
  category: "initia" | "external";
  accent: string;
}

function generateRoutes(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  livePrices?: Record<string, number>,
): SimRoute[] {
  if (!amountIn || Number(amountIn) <= 0) return [];
  const amt = Number(amountIn);
  const pair = `${tokenIn.symbol}-${tokenOut.symbol}`;

  // Live rate from CoinGecko, fallback to hardcoded
  const liveRate = livePrices
    ? getLiveRate(livePrices, tokenIn.symbol, tokenOut.symbol)
    : null;
  const rate = liveRate ?? FALLBACK_RATES[pair] ?? 1;
  const dec = Math.min(tokenOut.decimals, 6);

  // Initia ecosystem — near-zero gas, no bridge needed
  const direct = amt * rate * 0.997;
  const multiHop = amt * rate * 0.994;
  const crossChain = amt * rate * 0.991;

  const initiaRoutes: SimRoute[] = [
    {
      name: "RupiahRoute",
      protocol: "Direct Pool · 0.3%",
      output: direct.toFixed(dec),
      outputNum: direct,
      gas: "0.001",
      gasUsd: "<$0.01",
      best: true,
      diff: null,
      category: "initia",
      accent: "#16a34a",
    },
    {
      name: "Multi-hop",
      protocol: "2 Pools · 0.6%",
      output: multiHop.toFixed(dec),
      outputNum: multiHop,
      gas: "0.002",
      gasUsd: "<$0.01",
      best: false,
      diff: -Number((((multiHop - direct) / direct) * 100).toFixed(2)),
      category: "initia",
      accent: "#3b82f6",
    },
    {
      name: "L1 InitiaDEX",
      protocol: "Cross-chain · 0.9%",
      output: crossChain.toFixed(dec),
      outputNum: crossChain,
      gas: "0.005",
      gasUsd: "<$0.01",
      best: false,
      diff: -Number((((crossChain - direct) / direct) * 100).toFixed(2)),
      category: "initia",
      accent: "#06b6d4",
    },
  ];

  return initiaRoutes;
}

/* ── Token icon with multi-fallback logo ─────────────────── */

function TokenIcon({ symbol, logoURI, address, size = 20 }: {
  symbol: string; logoURI?: string; address?: string; size?: number;
}) {
  const [srcIdx, setSrcIdx] = useState(0);
  const urls = useMemo(() => {
    const u: string[] = [];
    if (logoURI) u.push(logoURI);
    if (address?.startsWith("0x") && address.length === 42) {
      u.push(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`);
    }
    return u;
  }, [logoURI, address]);

  useEffect(() => { setSrcIdx(0); }, [logoURI, address]);

  const ts = tokenStyle(symbol);
  const currentSrc = urls[srcIdx];

  if (currentSrc) {
    return (
      <img src={currentSrc} alt={symbol}
        className="rounded-full shrink-0 object-cover bg-purple/10"
        style={{ width: size, height: size }}
        onError={() => setSrcIdx((i) => i + 1)} />
    );
  }
  return (
    <div className={`${ts.bg} rounded-full flex items-center justify-center ring-2 ${ts.ring}`}
      style={{ width: size, height: size }}>
      <span className="font-bold text-white" style={{ fontSize: size * 0.4 }}>{symbol.charAt(0)}</span>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */

export function SwapView() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const { data: livePrices, isSuccess: isPriceLive, isError: isPriceError } = useLivePrices();

  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const parsedAmount = amountIn ? parseAmount(amountIn, tokenIn.decimals) : 0n;

  // Try real contract quote
  const {
    data: quoteData,
    isLoading: isQuoting,
    isError: isQuoteError,
  } = useReadContract({
    ...routerContract,
    functionName: "getQuote",
    args: [tokenIn.address, tokenOut.address, parsedAmount],
    query: {
      enabled: parsedAmount > 0n && isConnected,
      refetchInterval: 10000,
      retry: 1,
    },
  });

  const { writeContract, data: txHash, isPending: isSwapping } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  const contractOut = quoteData?.[0] ?? 0n;
  const route = quoteData?.[2];

  // Initia ecosystem routes — uses live CoinGecko prices when available
  const simRoutes = useMemo(
    () => generateRoutes(tokenIn, tokenOut, amountIn, livePrices),
    [tokenIn, tokenOut, amountIn, livePrices],
  );

  // External DEX quotes — real API calls + simulated fallback
  const fallbackRate = useMemo(() => {
    const lr = livePrices ? getLiveRate(livePrices, tokenIn.symbol, tokenOut.symbol) : null;
    return lr ?? FALLBACK_RATES[`${tokenIn.symbol}-${tokenOut.symbol}`] ?? 1;
  }, [livePrices, tokenIn.symbol, tokenOut.symbol]);

  const { data: externalQuotes, isLoading: isQuotesLoading } = useQuery({
    queryKey: ["dex-quotes", tokenIn.symbol, tokenOut.symbol, amountIn],
    queryFn: () => fetchAllDexQuotes(tokenIn.symbol, tokenOut.symbol, Number(amountIn), fallbackRate),
    enabled: !!amountIn && Number(amountIn) > 0,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // Selected route (0 = RupiahRoute best, index into simRoutes)
  const [selectedRoute, setSelectedRoute] = useState(0);
  useEffect(() => { setSelectedRoute(0); }, [tokenIn, tokenOut, amountIn]);

  // Price impact calculation
  const priceImpact = useMemo(() => {
    if (!amountIn || Number(amountIn) <= 0 || !simRoutes[0]) return 0;
    const spotRate = livePrices
      ? getLiveRate(livePrices, tokenIn.symbol, tokenOut.symbol)
      : null;
    const pair = `${tokenIn.symbol}-${tokenOut.symbol}`;
    const rate = spotRate ?? FALLBACK_RATES[pair];
    if (!rate) return 0;
    const idealOutput = Number(amountIn) * rate;
    return ((idealOutput - simRoutes[0].outputNum) / idealOutput) * 100;
  }, [amountIn, simRoutes, livePrices, tokenIn.symbol, tokenOut.symbol]);

  // Faucet quote — real on-chain rate
  const FAUCET_ADDR = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;
  const { data: faucetQuote } = useReadContract({
    address: FAUCET_ADDR,
    abi: [{ name: "getQuote", type: "function", stateMutability: "view", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] }],
    functionName: "getQuote",
    args: [tokenIn.address, tokenOut.address, parsedAmount],
    query: { enabled: parsedAmount > 0n, refetchInterval: 10000 },
  });

  const faucetOut = (faucetQuote as bigint) ?? 0n;

  // Best output: prefer faucet quote (real rate), fall back to simulation
  const formattedOut =
    faucetOut > 0n
      ? formatAmount(faucetOut, tokenOut.decimals)
      : simRoutes.length > 0
        ? simRoutes[0].output
        : "0";

  const expectedOut =
    faucetOut > 0n ? faucetOut : parsedAmount > 0n && simRoutes[0]
      ? parseAmount(simRoutes[0].output, tokenOut.decimals)
      : 0n;

  const minOut =
    (expectedOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

  // Read the best route from contract (uses findBestRoute)
  const { data: bestRouteData } = useReadContract({
    ...routerContract,
    functionName: "findBestRoute",
    args: [tokenIn.address, tokenOut.address, parsedAmount],
    query: {
      enabled: parsedAmount > 0n && isConnected,
      refetchInterval: 10000,
    },
  });

  // Faucet swap — no approval needed (burnFrom model)
  const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const [swapSuccess, setSwapSuccess] = useState(false);
  const { writeContract: writeSwap, data: swapTxHash, isPending: isSwapPending } = useWriteContract();
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash });
  const swapBusy = isSwapPending || isSwapConfirming;

  const handleSwap = useCallback(() => {
    if (!parsedAmount || parsedAmount === 0n) return;
    writeSwap({
      address: FAUCET_ADDRESS,
      abi: [{ name: "swap", type: "function", stateMutability: "nonpayable", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], outputs: [] }],
      functionName: "swap",
      args: [tokenIn.address, tokenOut.address, parsedAmount],
    });
  }, [parsedAmount, tokenIn, tokenOut, writeSwap, FAUCET_ADDRESS]);

  useEffect(() => {
    if (isSwapSuccess && address) {
      setSwapSuccess(true);
      const id = Date.now().toString(36);
      addActivity(address, {
        id,
        type: "swap",
        timestamp: Date.now(),
        txHash: swapTxHash,
        tokenIn: { symbol: tokenIn.symbol, amount: amountIn },
        tokenOut: { symbol: tokenOut.symbol, amount: formattedOut },
        recipient: recipient ?? undefined,
        priceImpact,
        slippage,
        status: "confirmed",
      });
      awardXP(address, "swap");
      setAmountIn("");
      setShowConfirm(false);
      setTimeout(() => setSwapSuccess(false), 3000);
    }
  }, [isSwapSuccess]);

  const handleFlip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  };

  // Activity recording is now handled inside handleSwap

  // Token balance check
  const { data: tokenInBalance } = useReadContract({
    address: tokenIn.address,
    abi: [{ name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] }],
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const userBalance = tokenInBalance ?? 0n;
  const insufficientBalance = parsedAmount > 0n && userBalance < parsedAmount;
  const formattedUserBalance = Number(userBalance) / 10 ** tokenIn.decimals;

  const disabled =
    !isConnected ||
    !amountIn ||
    parsedAmount === 0n ||
    insufficientBalance ||
    swapBusy;

  // Exchange rate string
  const rateStr = simRoutes[0]
    ? `1 ${tokenIn.symbol} \u2248 ${(simRoutes[0].outputNum / Number(amountIn || 1)).toFixed(6)} ${tokenOut.symbol}`
    : "";

  return (
    <div className="flex gap-4 w-full max-w-[960px] items-stretch">
      {/* ═══════ LEFT: Swap Form ═══════ */}
      <div className="w-[420px] shrink-0 flex flex-col">
        <div className="glass rounded-2xl glow-purple p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold">{t("swap.title")}</h2>
            <SlippageSettings slippage={slippage} onChange={setSlippage} />
          </div>

          {/* You pay */}
          <div className={`rounded-xl p-4 mb-1 border transition-all focus-within:border-purple/30 focus-within:shadow-[0_0_15px_rgba(159,41,255,0.1)] ${insufficientBalance ? "border-red/30" : "border-purple/10"}`} style={{ background: "rgba(18,18,42,0.6)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-muted font-medium">{t("swap.youPay")}</span>
              <span className={`text-[11px] font-medium ${insufficientBalance ? "text-red" : "text-text-muted"}`}>
                Balance: {formattedUserBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenIn.symbol}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TokenSelector
                selected={tokenIn}
                onSelect={setTokenIn}
                disabledToken={tokenOut}
              />
              <input
                type="number"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/30 min-w-0 text-right text-text"
              />
            </div>
          </div>

          {/* Flip */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleFlip}
              className="w-10 h-10 rounded-full border-2 border-purple/30 flex items-center justify-center text-purple-light hover:text-purple hover:border-purple/50 hover:shadow-[0_0_15px_rgba(159,41,255,0.2)] transition-all cursor-pointer active:scale-90"
              style={{ background: "rgba(15,15,35,0.9)" }}
            >
              <HiArrowsUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* You get */}
          <div className="rounded-xl p-4 mt-1 border border-purple/10" style={{ background: "rgba(18,18,42,0.6)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-muted font-medium">{t("swap.youGet")}</span>
              <span className="text-[11px] text-green font-pixel">OUTPUT</span>
            </div>
            <div className="flex items-center gap-3">
              <TokenSelector
                selected={tokenOut}
                onSelect={setTokenOut}
                disabledToken={tokenIn}
              />
              <div className="flex-1 text-[28px] font-semibold min-w-0 text-right">
                {isQuoting && !isQuoteError ? (
                  <div className="h-9 w-28 rounded-lg bg-purple/10 animate-pulse ml-auto" />
                ) : (
                  <span
                    className={formattedOut !== "0" ? "text-green" : "text-text-muted/30"}
                  >
                    {formattedOut}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Send to different address */}
          <RecipientToggle recipient={recipient} onChange={setRecipient} />

          {/* Rate + details */}
          {amountIn && Number(amountIn) > 0 && (
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              {rateStr && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">{t("common.route")}</span>
                  <span className="text-text-sub font-mono text-[11px]">
                    {rateStr}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-muted">Price impact</span>
                <PriceImpactBadge impact={priceImpact} />
              </div>
              {expectedOut > 0n && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">
                    {t("swap.minOutput")}
                  </span>
                  <span className="text-text-sub font-medium">
                    {formatAmount(minOut, tokenOut.decimals)} {tokenOut.symbol}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">
                  {t("common.gasEstimate")}
                </span>
                <span className="text-green font-medium">500 GAS</span>
              </div>
            </div>
          )}

          {/* Price impact danger warning */}
          {priceImpact >= 5 && amountIn && Number(amountIn) > 0 && (
            <PriceImpactWarning impact={priceImpact} />
          )}

          {/* Swap button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={disabled}
            className={`w-full mt-4 py-3.5 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer ${
              disabled
                ? "bg-bg text-text-muted cursor-not-allowed"
                : "bg-purple text-white hover:bg-purple-light active:scale-[0.99] glow-purple-sm"
            }`}
          >
            {!isConnected
              ? t("common.connectWallet")
              : swapBusy
                ? t("swap.swapping")
                : !amountIn
                  ? t("common.enterAmount")
                  : insufficientBalance
                    ? `Insufficient ${tokenIn.symbol} balance`
                    : t("swap.swapButton")}
          </button>

          {swapSuccess && (
            <div className="flex items-center justify-center gap-2 mt-3 text-[13px] text-green bg-green-bg rounded-xl py-3 font-medium">
              <HiCheckCircle className="w-4 h-4" />
              {t("swap.swapSuccess")}
            </div>
          )}

          {/* Swap confirmation modal */}
          <SwapConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => { handleSwap(); }}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            amountIn={amountIn}
            expectedOutput={formattedOut}
            minReceived={expectedOut > 0n ? formatAmount(minOut, tokenOut.decimals) : "0"}
            priceImpact={priceImpact}
            slippage={slippage}
            recipient={recipient}
            gasEstimate="500 GAS"
            routeName={simRoutes[0]?.name ?? "RupiahRoute"}
            routeProtocol={simRoutes[0]?.protocol ?? "Direct Pool"}
            savings={(() => {
              const ext = simRoutes.find((r) => r.category === "external");
              if (!ext) return undefined;
              return (simRoutes[0].outputNum - ext.outputNum).toFixed(Math.min(tokenOut.decimals, 4));
            })()}
            isSwapping={swapBusy}
          />
        </div>
      </div>

      {/* ═══════ RIGHT: Routes Panel ═══════ */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="glass rounded-2xl glow-purple p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold">
              {t("swap.routeComparison")}
            </h2>
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              {isPriceLive ? (
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
                  </span>
                  <span className="text-green font-medium">Live</span>
                </span>
              ) : isPriceError ? (
                <span className="flex items-center gap-1">
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  <span className="text-amber-500 font-medium">Offline</span>
                </span>
              ) : (
                <HiBolt className="w-3.5 h-3.5 text-amber-500" />
              )}
              Smart Routing
            </div>
          </div>

          {/* API unavailable notice */}
          {isPriceError && simRoutes.length > 0 && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber/10 border border-amber/20 text-[11px] text-amber">
              <span className="shrink-0">&#9888;</span>
              <span>Live price feed unavailable — using cached rates. Prices may not reflect current market.</span>
            </div>
          )}

          {simRoutes.length === 0 ? (
            /* ── Globe + orbiting chains idle state ── */
            <div className="flex flex-col items-center py-4">
              <div className="relative" style={{ width: 380, height: 380 }}>

                {/* Globe (centered) */}
                <div className="absolute" style={{ top: 100, left: 100, width: 180, height: 180 }}>
                  <World data={globeArcs} globeConfig={globeConfig} />
                </div>

                {/* Orbit ring 1 — inner (radius 110px) */}
                <div
                  className="absolute rounded-full border-2 border-purple/20"
                  style={{ top: 70, left: 70, width: 240, height: 240, animation: "orbitSlow 20s linear infinite" }}
                >
                  {[
                    { deg: 0,   img: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/INIT.png", alt: "INIT" },
                    { deg: 90,  img: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/ETH.png", alt: "ETH" },
                    { deg: 180, img: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/TIA.png", alt: "TIA" },
                    { deg: 270, img: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/USDC.png", alt: "USDC" },
                  ].map((c) => (
                    <div key={c.alt} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${c.deg}deg) translateX(120px) rotate(-${c.deg}deg)`, marginTop: -16, marginLeft: -16 }}>
                      <img src={c.img} alt={c.alt} className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-white box-border object-cover" />
                    </div>
                  ))}
                </div>

                {/* Orbit ring 2 — middle (radius 150px) */}
                <div
                  className="absolute rounded-full border-2 border-purple/20/80"
                  style={{ top: 40, left: 40, width: 300, height: 300, animation: "orbitFast 28s linear infinite reverse" }}
                >
                  {[
                    { deg: 0,   img: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg", alt: "ARB" },
                    { deg: 72,  img: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg", alt: "OP" },
                    { deg: 144, img: "https://icons.llamao.fi/icons/chains/rsz_base.jpg", alt: "BASE" },
                    { deg: 216, img: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png", alt: "ATOM" },
                    { deg: 288, img: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg", alt: "MATIC" },
                  ].map((c) => (
                    <div key={c.alt} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${c.deg}deg) translateX(150px) rotate(-${c.deg}deg)`, marginTop: -14, marginLeft: -14 }}>
                      <img src={c.img} alt={c.alt} className="w-7 h-7 rounded-full bg-white shadow border-2 border-white box-border object-cover" />
                    </div>
                  ))}
                </div>

                {/* Orbit ring 3 — outer (radius 190px) */}
                <div
                  className="absolute rounded-full border-2 border-purple/20/60"
                  style={{ top: 0, left: 0, width: 380, height: 380, animation: "orbitSlow 35s linear infinite" }}
                >
                  {[
                    { deg: 30,  img: "https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg", alt: "AVAX" },
                    { deg: 110, img: "https://icons.llamao.fi/icons/chains/rsz_solana.jpg", alt: "SOL" },
                    { deg: 190, img: "https://icons.llamao.fi/icons/chains/rsz_binance.jpg", alt: "BNB" },
                    { deg: 270, img: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/INIT.png", alt: "INIT2" },
                    { deg: 340, img: "https://icons.llamao.fi/icons/chains/rsz_fantom.jpg", alt: "FTM" },
                  ].map((c) => (
                    <div key={c.alt} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${c.deg}deg) translateX(190px) rotate(-${c.deg}deg)`, marginTop: -12, marginLeft: -12 }}>
                      <img src={c.img} alt={c.alt} className="w-6 h-6 rounded-full bg-white shadow border-2 border-white box-border object-cover" />
                    </div>
                  ))}
                </div>

              </div>

              <h3 className="font-bold text-[15px] text-text mt-3">
                Smart Router
              </h3>
              <p className="text-[12px] text-text-muted text-center mt-1 max-w-[240px]">
                Otomatis temukan jalur swap terbaik di seluruh ekosistem Initia
              </p>
            </div>
          ) : (
            <div
              className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.3) transparent" }}
            >
              {/* ── Initia Ecosystem Routes (clickable) ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/INIT.png"
                    alt="Initia"
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-[12px] font-semibold text-text">
                    Initia Ecosystem
                  </span>
                  <span className="text-[10px] font-medium text-green bg-green/10 px-1.5 py-0.5 rounded">
                    Near-zero gas
                  </span>
                </div>
                <div className="space-y-2">
                  {simRoutes.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedRoute(i)}
                      className={`w-full text-left rounded-xl p-3.5 border transition-all cursor-pointer ${
                        selectedRoute === i
                          ? "border-purple bg-purple-bg ring-2 ring-purple/20 glow-purple-sm"
                          : "border-border bg-purple/5 hover:bg-purple/10 hover:border-purple/30"
                      }`}
                      style={{ borderLeftWidth: 3, borderLeftColor: r.accent }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={tokenOut.symbol} logoURI={tokenOut.logoURI} address={tokenOut.address} size={20} />
                          <span className="text-[15px] font-bold text-text">
                            {r.output} {tokenOut.symbol}
                          </span>
                          {r.best && <HiBolt className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {r.best && (
                            <span className="text-[10px] font-bold text-green bg-green/10 px-2 py-0.5 rounded-full">
                              Best Rate
                            </span>
                          )}
                          {selectedRoute === i && (
                            <span className="text-[10px] font-bold text-white bg-text px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                          {r.diff !== null && r.diff !== 0 && (
                            <span className="text-[11px] font-bold text-red">
                              {r.diff > 0 ? "+" : ""}{r.diff.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">
                          via <span className="font-medium text-text-sub">{r.name}</span>
                          {" · "}{r.protocol}
                        </span>
                        <span className="text-green font-medium">{r.gasUsd} gas</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── External DEX Live Quotes ── */}
              {(isQuotesLoading || (externalQuotes && externalQuotes.length > 0)) && (
                <>
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                      {isQuotesLoading ? "Fetching live quotes..." : `vs ${externalQuotes!.length} external DEXs`}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] font-semibold text-text-sub">
                        Other DEXs
                      </span>
                      <span className="text-[9px] font-bold text-green bg-green/10 px-1.5 py-0.5 rounded">
                        LIVE API
                      </span>
                      {isQuotesLoading && (
                        <span className="w-3 h-3 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {(externalQuotes ?? []).map((q, i) => {
                        const bestInitia = simRoutes[0]?.outputNum ?? 0;
                        const diff = bestInitia > 0 ? -((bestInitia - q.outputAmount) / bestInitia * 100) : 0;
                        const dec = Math.min(tokenOut.decimals, 6);
                        return (
                          <div
                            key={i}
                            className="rounded-lg px-3 py-2.5 border border-border bg-bg/30 hover:bg-bg/60 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: q.accent }}
                                />
                                <span className="text-[12px] font-semibold text-text-sub">
                                  {q.name}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                  {q.protocol}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-medium text-text-sub">
                                  {q.outputAmount.toFixed(dec)}
                                </span>
                                <span className="text-[10px] font-bold text-red">
                                  {diff.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted">
                              <span>
                                Gas: <span className="text-red font-medium">{q.gasUsd}</span>
                              </span>
                              <span>
                                {(q.outputAmount - bestInitia).toFixed(Math.min(tokenOut.decimals, 4))}{" "}
                                {tokenOut.symbol} less
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Savings summary */}
                  {externalQuotes?.[0] && simRoutes[0] && (
                    <div className="rounded-xl bg-green/5 border border-green/20 p-3 text-center">
                      <div className="text-[13px] font-semibold text-green">
                        RupiahRoute saves you{" "}
                        {(simRoutes[0].outputNum - externalQuotes[0].outputAmount).toFixed(Math.min(tokenOut.decimals, 4))}{" "}
                        {tokenOut.symbol}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        vs {externalQuotes[0].name} (live quote) · Near-zero gas vs {externalQuotes[0].gasUsd}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
