"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useTranslation } from "react-i18next";
import {
  parseAmount,
  formatAmount,
  TOKENS,
  type Token,
} from "@/lib/contract";
import { routerContract } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { tokenStyle } from "@/lib/tokens";
import {
  HiArrowsUpDown,
  HiCog6Tooth,
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

/* ── Simulated exchange rates for demo ───────────────────── */

const RATES: Record<string, number> = {
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

interface SimRoute {
  name: string;
  protocol: string;
  output: string;
  outputNum: number;
  gas: string;
  best: boolean;
  diff: number | null;
}

function generateRoutes(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
): SimRoute[] {
  if (!amountIn || Number(amountIn) <= 0) return [];
  const amt = Number(amountIn);
  const pair = `${tokenIn.symbol}-${tokenOut.symbol}`;
  const rate = RATES[pair] ?? 1;
  const dec = Math.min(tokenOut.decimals, 6);

  const direct = amt * rate * 0.997;
  const multiHop = amt * rate * 0.994;
  const crossChain = amt * rate * 0.991;

  return [
    {
      name: "RupiahRoute",
      protocol: "Direct Pool",
      output: direct.toFixed(dec),
      outputNum: direct,
      gas: "0.001",
      best: true,
      diff: null,
    },
    {
      name: "Multi-hop",
      protocol: "2 Pools",
      output: multiHop.toFixed(dec),
      outputNum: multiHop,
      gas: "0.002",
      best: false,
      diff: -Number((((multiHop - direct) / direct) * 100).toFixed(2)),
    },
    {
      name: "L1 InitiaDEX",
      protocol: "Cross-chain",
      output: crossChain.toFixed(dec),
      outputNum: crossChain,
      gas: "0.005",
      best: false,
      diff: -Number((((crossChain - direct) / direct) * 100).toFixed(2)),
    },
  ];
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
        className="rounded-full shrink-0 object-cover bg-neutral-100"
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

  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

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

  // Use simulated routes for display (always available for demo)
  const simRoutes = useMemo(
    () => generateRoutes(tokenIn, tokenOut, amountIn),
    [tokenIn, tokenOut, amountIn],
  );

  // Best output: prefer contract data, fall back to simulation
  const formattedOut =
    contractOut > 0n
      ? formatAmount(contractOut, tokenOut.decimals)
      : simRoutes.length > 0
        ? simRoutes[0].output
        : "0";

  const expectedOut =
    contractOut > 0n ? contractOut : parsedAmount > 0n && simRoutes[0]
      ? parseAmount(simRoutes[0].output, tokenOut.decimals)
      : 0n;

  const minOut =
    (expectedOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

  const handleSwap = useCallback(() => {
    if (!route || contractOut === 0n) return;
    writeContract({
      ...routerContract,
      functionName: "executeRoute",
      args: [
        {
          routeType: route.routeType,
          path: [...route.path],
          poolIds: [...route.poolIds],
          amountIn: route.amountIn,
          expectedOut: route.expectedOut,
          estimatedGas: route.estimatedGas,
        },
        minOut,
        BigInt(Math.floor(Date.now() / 1000) + 1200),
      ],
    });
  }, [route, contractOut, minOut, writeContract]);

  const handleFlip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  };

  useEffect(() => {
    if (isSuccess) setAmountIn("");
  }, [isSuccess]);

  const disabled =
    !isConnected ||
    !amountIn ||
    parsedAmount === 0n ||
    isSwapping ||
    isConfirming;

  // Exchange rate string
  const rateStr = simRoutes[0]
    ? `1 ${tokenIn.symbol} \u2248 ${(simRoutes[0].outputNum / Number(amountIn || 1)).toFixed(6)} ${tokenOut.symbol}`
    : "";

  return (
    <div className="flex gap-4 w-full max-w-[880px] items-start">
      {/* ═══════ LEFT: Swap Form ═══════ */}
      <div className="w-[440px] shrink-0">
        <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/[0.04] p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold">{t("swap.title")}</h2>
            <div className="flex items-center gap-2">
              {showSettings && (
                <div className="flex gap-1">
                  {[0.1, 0.5, 1, 3].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSlippage(v)}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-medium cursor-pointer transition-colors ${
                        slippage === v
                          ? "bg-text text-white"
                          : "bg-bg text-text-sub hover:bg-border"
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-bg text-text-muted hover:text-text-sub transition-colors cursor-pointer text-[12px]"
              >
                {slippage}%
                <HiCog6Tooth className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* You pay */}
          <div className="rounded-xl bg-bg p-4 mb-1">
            <div className="text-[12px] text-text-muted mb-2">
              {t("swap.youPay")}
            </div>
            <div className="flex items-center gap-3">
              <TokenSelector
                selected={tokenIn}
                onSelect={setTokenIn}
                disabledToken={tokenOut}
              />
              <input
                type="number"
                placeholder="0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-neutral-300 min-w-0 text-right"
              />
            </div>
          </div>

          {/* Flip */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleFlip}
              className="w-9 h-9 rounded-full bg-white border-[3px] border-bg flex items-center justify-center text-text-muted hover:text-text hover:border-border transition-all cursor-pointer active:scale-90"
            >
              <HiArrowsUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* You get */}
          <div className="rounded-xl bg-bg p-4 mt-1">
            <div className="text-[12px] text-text-muted mb-2">
              {t("swap.youGet")}
            </div>
            <div className="flex items-center gap-3">
              <TokenSelector
                selected={tokenOut}
                onSelect={setTokenOut}
                disabledToken={tokenIn}
              />
              <div className="flex-1 text-[28px] font-semibold min-w-0 text-right">
                {isQuoting && !isQuoteError ? (
                  <div className="h-9 w-28 rounded-lg bg-border animate-pulse ml-auto" />
                ) : (
                  <span
                    className={
                      formattedOut !== "0" ? "text-text" : "text-neutral-300"
                    }
                  >
                    {formattedOut}
                  </span>
                )}
              </div>
            </div>
          </div>

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
                <span className="text-green font-medium">~0.001 GAS</span>
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleSwap}
            disabled={disabled}
            className={`w-full mt-4 py-3.5 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer ${
              disabled
                ? "bg-bg text-text-muted cursor-not-allowed"
                : "bg-text text-white hover:bg-neutral-800 active:scale-[0.99]"
            }`}
          >
            {!isConnected
              ? t("common.connectWallet")
              : isSwapping || isConfirming
                ? t("swap.swapping")
                : !amountIn
                  ? t("common.enterAmount")
                  : t("swap.swapButton")}
          </button>

          {isSuccess && (
            <div className="flex items-center justify-center gap-2 mt-3 text-[13px] text-green bg-green-bg rounded-xl py-3 font-medium">
              <HiCheckCircle className="w-4 h-4" />
              {t("swap.swapSuccess")}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ RIGHT: Routes Panel ═══════ */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/[0.04] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold">
              {t("swap.routeComparison")}
            </h2>
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <HiBolt className="w-3.5 h-3.5 text-amber-500" />
              Smart Routing
            </div>
          </div>

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
                  className="absolute rounded-full border-2 border-neutral-400"
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
                  className="absolute rounded-full border-2 border-neutral-400/80"
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
                  className="absolute rounded-full border-2 border-neutral-400/60"
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
            <div className="space-y-2.5">
              {simRoutes.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 border transition-colors ${
                    r.best
                      ? "border-green bg-green-bg/50"
                      : "border-border bg-bg/50 hover:bg-bg"
                  }`}
                >
                  {/* Output */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TokenIcon symbol={tokenOut.symbol} logoURI={tokenOut.logoURI} address={tokenOut.address} size={22} />
                      <span className="text-[16px] font-bold text-text">
                        {r.output} {tokenOut.symbol}
                      </span>
                      <HiBolt className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    {r.best && (
                      <span className="text-[11px] font-bold text-green bg-green/10 px-2.5 py-1 rounded-full">
                        Best
                      </span>
                    )}
                    {r.diff !== null && r.diff !== 0 && (
                      <span className="text-[11px] font-bold text-red">
                        {r.diff > 0 ? "+" : ""}
                        {r.diff.toFixed(2)}%
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-text-muted">
                      via{" "}
                      <span className="font-medium text-text-sub">
                        {r.name}
                      </span>{" "}
                      ({r.protocol})
                    </span>
                    <span className="text-text-muted font-mono">
                      <span className="text-green">{r.gas}</span> GAS
                    </span>
                  </div>
                </div>
              ))}

              {/* Savings summary */}
              {simRoutes.length > 1 && (
                <div className="text-center text-[12px] text-green font-medium pt-1">
                  Smart routing hemat{" "}
                  {(simRoutes[0].outputNum - simRoutes[simRoutes.length - 1].outputNum).toFixed(
                    Math.min(tokenOut.decimals, 4),
                  )}{" "}
                  {tokenOut.symbol} vs worst route
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
