"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, formatAmount, formatRupiah, TOKENS, type Token } from "@/lib/contract";
import { routerContract } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { RouteDisplay } from "./RouteDisplay";
import { HiArrowsUpDown, HiCog6Tooth, HiCheckCircle } from "react-icons/hi2";

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  const parsedAmount = amountIn ? parseAmount(amountIn, tokenIn.decimals) : 0n;

  const { data: quoteData, isLoading: isQuoting, isError: isQuoteError } = useReadContract({
    ...routerContract, functionName: "getQuote",
    args: [tokenIn.address, tokenOut.address, parsedAmount],
    query: { enabled: parsedAmount > 0n && isConnected, refetchInterval: 10000, retry: 1 },
  });

  const { writeContract, data: txHash, isPending: isSwapping } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const expectedOut = quoteData?.[0] ?? 0n;
  const gasEstimate = quoteData?.[1] ?? 0n;
  const route = quoteData?.[2];
  const formattedOut = expectedOut > 0n ? formatAmount(expectedOut, tokenOut.decimals) : "0";
  const minOut = (expectedOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

  const routeDisplayData = route && expectedOut > 0n ? [{
    routeType: route.routeType, path: [...route.path],
    expectedOut: `${formattedOut} ${tokenOut.symbol}`, estimatedGas: gasEstimate.toString(),
    savings: route.routeType === 1 ? formatRupiah(0.26) : undefined,
  }] : [];

  const handleSwap = useCallback(() => {
    if (!route || expectedOut === 0n) return;
    writeContract({ ...routerContract, functionName: "executeRoute",
      args: [{ routeType: route.routeType, path: [...route.path], poolIds: [...route.poolIds],
        amountIn: route.amountIn, expectedOut: route.expectedOut, estimatedGas: route.estimatedGas },
        minOut, BigInt(Math.floor(Date.now() / 1000) + 1200)] });
  }, [route, expectedOut, minOut, writeContract]);

  const handleFlip = () => { setTokenIn(tokenOut); setTokenOut(tokenIn); setAmountIn(""); };
  useEffect(() => { if (isSuccess) setAmountIn(""); }, [isSuccess]);
  const disabled = !isConnected || !amountIn || parsedAmount === 0n || isSwapping || isConfirming;

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-bold">{t("swap.title")}</h2>
        <button onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-bg text-text-muted hover:text-text-sub transition-colors cursor-pointer">
          <HiCog6Tooth className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
          <span className="text-[8px] text-text-muted">{t("common.slippage")}</span>
          <div className="flex gap-1">
            {[0.1, 0.5, 1, 3].map((v) => (
              <button key={v} onClick={() => setSlippage(v)}
                className={`px-2.5 py-1 text-[8px] rounded-lg font-medium cursor-pointer transition-colors ${
                  slippage === v ? "bg-purple text-white" : "bg-bg text-text-sub hover:bg-border"
                }`}>{v}%</button>
            ))}
          </div>
        </div>
      )}

      {/* You pay */}
      <div className="rounded-xl bg-bg p-4 mb-1">
        <div className="text-[8px] text-text-muted mb-2">{t("swap.youPay")}</div>
        <div className="flex items-center gap-3">
          <input type="number" placeholder="0" value={amountIn} onChange={(e) => setAmountIn(e.target.value)}
            className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/30 min-w-0" />
          <TokenSelector selected={tokenIn} onSelect={setTokenIn} disabledToken={tokenOut} />
        </div>
      </div>

      {/* Flip */}
      <div className="flex justify-center -my-3 relative z-10">
        <button onClick={handleFlip}
          className="w-9 h-9 rounded-full bg-bg border-[3px] border-purple/20 flex items-center justify-center text-text-muted hover:text-text hover:border-purple/40 transition-all cursor-pointer active:scale-90">
          <HiArrowsUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* You get */}
      <div className="rounded-xl bg-bg p-4 mt-1">
        <div className="text-[8px] text-text-muted mb-2">{t("swap.youGet")}</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-[28px] font-semibold min-w-0">
            {isQuoting && !isQuoteError
              ? <div className="h-9 w-28 rounded-lg bg-border animate-pulse" />
              : <span className={expectedOut > 0n ? "text-text" : "text-text-muted/30"}>{formattedOut}</span>}
          </div>
          <TokenSelector selected={tokenOut} onSelect={setTokenOut} disabledToken={tokenIn} />
        </div>
      </div>

      {/* Route */}
      {routeDisplayData.length > 0 && (
        <div className="mt-3"><RouteDisplay routes={routeDisplayData} bestIndex={0} /></div>
      )}

      {/* Details */}
      {expectedOut > 0n && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <div className="flex justify-between text-[8px]">
            <span className="text-text-muted">{t("swap.minOutput")}</span>
            <span className="text-text-sub font-medium">{formatAmount(minOut, tokenOut.decimals)} {tokenOut.symbol}</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="text-text-muted">{t("common.route")}</span>
            <span className="text-text-sub font-medium">
              {route?.routeType === 0 ? t("common.direct") : route?.routeType === 1 ? t("common.multiHop") : t("common.crossChain")}
            </span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="text-text-muted">{t("common.gasEstimate")}</span>
            <span className="text-green font-medium">~0.001 GAS</span>
          </div>
        </div>
      )}

      {/* Fee info */}
      {parsedAmount > 0n && expectedOut === 0n && !isQuoting && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-[8px]">
            <span className="text-text-muted">{t("common.gasEstimate")}</span>
            <span className="text-green font-medium">~0.001 GAS</span>
          </div>
        </div>
      )}

      {/* Button */}
      <button onClick={handleSwap} disabled={disabled}
        className={`w-full mt-4 py-3.5 rounded-xl text-[14px] font-semibold transition-colors cursor-pointer ${
          disabled ? "bg-bg text-text-muted cursor-not-allowed" : "bg-purple text-white hover:bg-purple-light active:scale-[0.99]"
        }`}>
        {!isConnected ? t("common.connectWallet") : isSwapping || isConfirming ? t("swap.swapping") : !amountIn ? t("common.enterAmount") : t("swap.swapButton")}
      </button>

      {isSuccess && (
        <div className="flex items-center justify-center gap-2 mt-3 text-[8px] text-green bg-green-bg rounded-xl py-3 font-medium">
          <HiCheckCircle className="w-4 h-4" />{t("swap.swapSuccess")}
        </div>
      )}
    </div>
  );
}
