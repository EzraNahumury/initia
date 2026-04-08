"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
            /* ── Orbit animation (idle state) ── */
            <div className="flex flex-col items-center py-6">
              <div className="relative w-[220px] h-[220px]">
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border border-neutral-100" />
                <div className="absolute inset-6 rounded-full border border-neutral-100" />
                <div className="absolute inset-12 rounded-full border border-neutral-100" />

                {/* Center logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-text flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">RR</span>
                  </div>
                </div>

                {/* Outer ring icons (slow) */}
                <div className="absolute inset-0 animate-[orbitSlow_20s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <TokenIcon symbol="INIT" size={24} />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <TokenIcon symbol="ETH" size={24} />
                  </div>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
                    <TokenIcon symbol="TIA" size={24} />
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
                    <TokenIcon symbol="USDC" size={24} />
                  </div>
                </div>

                {/* Inner ring icons (faster, opposite) */}
                <div className="absolute inset-6 animate-[orbitFast_14s_linear_infinite_reverse]">
                  <div className="absolute top-0 right-[15%] -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-500">D</div>
                  </div>
                  <div className="absolute bottom-0 left-[15%] translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-500">M</div>
                  </div>
                  <div className="absolute top-[15%] left-0 -translate-x-1/2">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-500">L1</div>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-[15px] text-text mt-4">
                Smart Router
              </h3>
              <p className="text-[12px] text-text-muted text-center mt-1 max-w-[240px]">
                Otomatis temukan jalur swap terbaik di seluruh ekosistem Initia
              </p>

              <div className="flex items-center gap-4 mt-4 text-[11px] text-text-sub font-medium">
                <span className="flex items-center gap-1">
                  <HiCheckCircle className="w-3.5 h-3.5 text-green" />
                  Near-Zero Fee
                </span>
                <span className="flex items-center gap-1">
                  <HiCheckCircle className="w-3.5 h-3.5 text-green" />
                  Best Rates
                </span>
                <span className="flex items-center gap-1">
                  <HiCheckCircle className="w-3.5 h-3.5 text-green" />
                  100ms
                </span>
              </div>
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
